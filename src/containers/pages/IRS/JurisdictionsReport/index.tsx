import DrillDownTable, { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetFormData } from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import 'react-table/react-table.css';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import IRSTableCell from '../../../../components/IRSTableCell';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_IRS_REPORTING_PLANS_SLICE,
} from '../../../../configs/env';
import { HOME, HOME_URL, IRS_REPORTING_TITLE, REPORT_IRS_PLAN_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { FlexObject, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import IRSJurisdictionsReducer, {
  fetchIRSJurisdictions,
  getIRSJurisdictionsArray,
  IRSJurisdiction,
  reducerName as IRSJurisdictionsReducerName,
} from '../../../../store/ducks/IRS/jurisdictions';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/IRS/plans';
import { getTree, ZambiaFocusAreasColumns, ZambiaJurisdictionsColumns } from './helpers';
import './style.css';

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(IRSJurisdictionsReducerName, IRSJurisdictionsReducer);

const slices = SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');

export interface IRSJurisdictionProps {
  fetchJurisdictions: typeof fetchIRSJurisdictions;
  fetchPlans: typeof fetchIRSPlans;
  hasChildren: typeof hasChildrenFunc;
  jurisdictions: IRSJurisdiction[] | null;
  plan: IRSPlan | null;
  service: typeof supersetFetch;
}

/** Renders IRS Jurisdictions reports */
const IRSJurisdictions = (props: IRSJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const [jurisdictionId, setJurisdictionId] = useState<string | null>(
    props.match && props.match.params && props.match.params.jurisdictionId
      ? props.match.params.jurisdictionId
      : null
  );
  const [loading, setLoading] = useState<boolean>(true);

  let planId: string | null = null;
  if (props.match && props.match.params && props.match.params.planId) {
    planId = props.match.params.planId;
  }
  const { fetchJurisdictions, fetchPlans, hasChildren, jurisdictions, plan, service } = props;

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(!plan || !jurisdictions || jurisdictions.length < 1); // set loading when there is no data
      let fetchPlansParams: SupersetFormData | null = null;
      if (planId) {
        fetchPlansParams = superset.getFormData(1, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
        ]);
      }

      await service(SUPERSET_IRS_REPORTING_PLANS_SLICE, fetchPlansParams).then(
        (result: IRSPlan[]) => fetchPlans(result)
      );

      slices.forEach(async slice => {
        let fetchJurisdictionsParams: SupersetFormData | null = null;
        if (planId) {
          fetchJurisdictionsParams = superset.getFormData(
            3000,
            [{ comparator: planId, operator: '==', subject: 'plan_id' }],
            { jurisdiction_depth: true }
          );
        }
        await service(slice, fetchJurisdictionsParams).then((result: IRSJurisdiction[]) =>
          fetchJurisdictions(slice, result)
        );
      });
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (props.match && props.match.params && props.match.params.jurisdictionId) {
      setJurisdictionId(props.match.params.jurisdictionId);
    } else {
      setJurisdictionId(null);
    }
  }, [props.match.params.jurisdictionId]);

  if (loading === true) {
    return <Loading />;
  }

  const data = jurisdictions || [];

  const parentNodes = data.map((el: FlexObject) => el.jurisdiction_parent_id);

  let pageTitle = IRS_REPORTING_TITLE;
  let baseURL = REPORT_IRS_PLAN_URL;
  const basePage = {
    label: pageTitle,
    url: REPORT_IRS_PLAN_URL,
  };
  const breadcrumbProps = {
    currentPage: basePage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  let planPage = basePage;
  if (plan) {
    pageTitle = `${IRS_REPORTING_TITLE}: ${plan.plan_title}`;
    baseURL = `${REPORT_IRS_PLAN_URL}/${plan.plan_id}`;
    planPage = {
      label: plan.plan_title,
      url: baseURL,
    };
    breadcrumbProps.currentPage = planPage;
    breadcrumbProps.pages.push(basePage);
  }

  const theObject = data.filter((el: FlexObject) => el.jurisdiction_id === jurisdictionId);

  let currentJurisdictionName: string | null = null;
  if (theObject && theObject.length > 0) {
    const theTree = getTree(data, theObject[0]);
    theTree.reverse();
    const pages = theTree.map(el => {
      return {
        label: el.jurisdiction_name,
        url: `${baseURL}/${el.jurisdiction_id}`,
      };
    });

    breadcrumbProps.pages.push(planPage);

    const newPages = breadcrumbProps.pages.concat(pages);
    breadcrumbProps.pages = newPages;

    const currentPage = {
      label: theObject[0].jurisdiction_name,
      url: `${baseURL}/${theObject[0].jurisdiction_id}`,
    };
    breadcrumbProps.currentPage = currentPage;

    currentJurisdictionName = theObject[0].jurisdiction_name;
  }

  const currLevelData = data.filter(el => el.jurisdiction_parent_id === jurisdictionId);

  let columnsToUse = ZambiaJurisdictionsColumns;
  if (currLevelData && currLevelData.length > 0) {
    if (
      currLevelData[0].jurisdiction_depth === +SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL
    ) {
      columnsToUse = ZambiaFocusAreasColumns;
    }
  }

  const tableProps = {
    CellComponent: IRSTableCell,
    columns: columnsToUse,
    data,
    defaultPageSize: data.length,
    extraCellProps: { urlPath: baseURL },
    getTdProps: (state: any, rowInfo: any, column: any, instance: any) => {
      return {
        onClick: (e: any, handleOriginal: any) => {
          if (
            column.id === 'jurisdiction_name' &&
            hasChildren(rowInfo, parentNodes, 'jurisdiction_id')
          ) {
            setJurisdictionId(rowInfo.original.jurisdiction_id);
          }
          if (handleOriginal) {
            handleOriginal();
          }
        },
      };
    },
    identifierField: 'jurisdiction_id',
    linkerField: 'jurisdiction_name',
    minRows: 0,
    parentIdentifierField: 'jurisdiction_parent_id',
    resizable: true,
    rootParentId: jurisdictionId || '',
    shouldUseEffect: false,
    showPagination: false,
    useDrillDownTrProps: false,
  };

  const currentTitle = currentJurisdictionName
    ? `${pageTitle}: ${currentJurisdictionName}`
    : pageTitle;

  return (
    <div key={`${jurisdictionId || '0'}-${data.length}`}>
      <Helmet>
        <title>{currentTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{currentTitle}</h3>
          <div className="irs-report-table">
            <DrillDownTable {...tableProps} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

const defaultProps: IRSJurisdictionProps = {
  fetchJurisdictions: fetchIRSJurisdictions,
  fetchPlans: fetchIRSPlans,
  hasChildren: hasChildrenFunc,
  jurisdictions: null,
  plan: null,
  service: supersetFetch,
};

IRSJurisdictions.defaultProps = defaultProps;

export { IRSJurisdictions };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plan: IRSPlan | null;
  jurisdictions: IRSJurisdiction[] | null;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId = ownProps.match.params.planId || null;
  const plan = getIRSPlanById(state, planId);
  let jurisdictions: IRSJurisdiction[] = [];

  slices.forEach(
    slice => (jurisdictions = jurisdictions.concat(getIRSJurisdictionsArray(state, slice, planId)))
  );

  return {
    jurisdictions,
    plan,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchJurisdictions: fetchIRSJurisdictions, fetchPlans: fetchIRSPlans };

/** Connected ActiveFI component */
const ConnectedIRSJurisdictions = connect(
  mapStateToProps,
  mapDispatchToProps
)(IRSJurisdictions);

export default ConnectedIRSJurisdictions;
