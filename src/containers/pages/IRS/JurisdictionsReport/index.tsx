import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
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
import { SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { HOME, HOME_URL, IRS_REPORTING_TITLE, REPORT_IRS_PLAN_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { FlexObject, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/IRS/plans';
import { getTree, ZambiaFocusAreasColumns, ZambiaJurisdictionsColumns } from './helpers';
import './style.css';
import * as fixtures from './tests/fixtures';

/** register the plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

export interface IRSJurisdictionProps {
  fetchPlans: typeof fetchIRSPlans;
  plan: IRSPlan | null;
  service: typeof supersetFetch;
}

const data1 = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];
const data2 = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const data = [...data1, ...data2];

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
  const { fetchPlans, plan, service } = props;

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(!plan); // set loading when there is no plan
      let fetchPlansParams = null;
      if (planId) {
        fetchPlansParams = superset.getFormData(1, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
        ]);
      }

      await service(SUPERSET_IRS_REPORTING_PLANS_SLICE, fetchPlansParams).then(
        (result: IRSPlan[]) => fetchPlans(result)
      );
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

  if (plan) {
    pageTitle = `${IRS_REPORTING_TITLE}: ${plan.plan_title}`;
    baseURL = `${REPORT_IRS_PLAN_URL}/${plan.plan_id}`;
    const planPage = {
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

    breadcrumbProps.pages.push(basePage);

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
    if (currLevelData[0].jurisdiction_depth === 2) {
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
          if (column.id === 'jurisdiction_name') {
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
    <div key={jurisdictionId || '0'}>
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
  fetchPlans: fetchIRSPlans,
  plan: null,
  service: supersetFetch,
};

IRSJurisdictions.defaultProps = defaultProps;

export { IRSJurisdictions };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plan: IRSPlan | null;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const plan = getIRSPlanById(state, ownProps.match.params.planId);
  return {
    plan,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchIRSPlans };

/** Connected ActiveFI component */
const ConnectedIRSJurisdictions = connect(
  mapStateToProps,
  mapDispatchToProps
)(IRSJurisdictions);

export default ConnectedIRSJurisdictions;
