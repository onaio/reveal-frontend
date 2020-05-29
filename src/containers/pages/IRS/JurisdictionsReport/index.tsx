import DrillDownTable, { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetFormData } from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Column, RowInfo } from 'react-table';
import 'react-table/react-table.css';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import IRSTableCell from '../../../../components/IRSTableCell';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS,
  SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS,
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_IRS_REPORTING_PLANS_SLICE,
  SUPERSET_MAX_RECORDS,
} from '../../../../configs/env';
import { HOME, IRS_REPORTING_TITLE } from '../../../../configs/lang';
import { HOME_URL, REPORT_IRS_PLAN_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import '../../../../helpers/tables.css';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionsArray,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../store/ducks/generic/jurisdictions';
import {
  fetchMDAPointPlans,
  getMDAPointPlanById,
} from '../../../../store/ducks/generic/mdaPointPlan';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import { getJurisdictionBreadcrumbs } from '../Map/helpers';
import { IRSTableColumns } from './helpers';
import './style.css';

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** IRS Jurisdictions props */
export interface GenericJurisdictionProps {
  currentBaseURL: string;
  currentPageTitle: string;
  fetchJurisdictions: typeof fetchGenericJurisdictions;
  fetchPlans: typeof fetchIRSPlans;
  focusAreaColumn: string;
  focusAreaLevel: string;
  getPlanById: typeof getMDAPointPlanById | null;
  hasChildren: typeof hasChildrenFunc;
  jurisdictionColumn: string;
  jurisdictions: GenericJurisdiction[] | null;
  newFetchPlan: typeof fetchMDAPointPlans | null;
  plan: IRSPlan | null;
  reportingPlanSlice: string;
  service: typeof supersetFetch;
  slices: string[];
}

/** Renders IRS Jurisdictions reports */
const JurisdictionReport = (props: GenericJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const [jurisdictionId, setJurisdictionId] = useState<string | null>(
    (props.match && props.match.params && props.match.params.jurisdictionId) || null
  );
  const [loading, setLoading] = useState<boolean>(true);

  let planId: string | null = null;
  if (props.match && props.match.params && props.match.params.planId) {
    planId = props.match.params.planId;
  }
  const {
    fetchJurisdictions,
    fetchPlans,
    hasChildren,
    jurisdictions,
    plan,
    service,
    slices,
    currentBaseURL,
    currentPageTitle,
    jurisdictionColumn,
    focusAreaColumn,
    focusAreaLevel,
    newFetchPlan,
    reportingPlanSlice,
  } = props;

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

      await service(reportingPlanSlice, fetchPlansParams).then((result: IRSPlan[]) => {
        newFetchPlan ? newFetchPlan(result) : fetchPlans(result);
      });

      slices.forEach(async slice => {
        let fetchJurisdictionsParams: SupersetFormData | null = null;
        if (planId) {
          fetchJurisdictionsParams = superset.getFormData(
            SUPERSET_MAX_RECORDS,
            [{ comparator: planId, operator: '==', subject: 'plan_id' }],
            { jurisdiction_depth: true, jurisdiction_name: true }
          );
        }
        await service(slice, fetchJurisdictionsParams).then((result: GenericJurisdiction[]) =>
          fetchJurisdictions(slice, result)
        );
      });
    } catch (e) {
      // todo - handle error https://github.com/onaio/reveal-frontend/issues/300
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
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

  const parentNodes = data.map((el: Dictionary) => el.jurisdiction_parent_id);

  let pageTitle = currentPageTitle;
  let baseURL = currentBaseURL;
  const basePage = {
    label: pageTitle,
    url: currentBaseURL,
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
    pageTitle = `${currentPageTitle}: ${plan.plan_title}`;
    baseURL = `${currentBaseURL}/${plan.plan_id}`;
    planPage = {
      label: plan.plan_title,
      url: baseURL,
    };
    breadcrumbProps.currentPage = planPage;
    breadcrumbProps.pages.push(basePage);
  }

  const theObject = data.filter((el: Dictionary) => el.jurisdiction_id === jurisdictionId);

  let currentJurisdictionName: string | null = null;
  if (theObject && theObject.length > 0) {
    const pages = getJurisdictionBreadcrumbs(theObject[0], baseURL);

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

  let columnsToUse = get(IRSTableColumns, jurisdictionColumn, null);
  if (currLevelData && currLevelData.length > 0) {
    if (currLevelData[0].jurisdiction_depth === +focusAreaLevel) {
      columnsToUse = get(IRSTableColumns, focusAreaColumn, null);
    }
  }

  const tableProps = {
    ...(columnsToUse && { columns: columnsToUse }),
    CellComponent: IRSTableCell,
    data,
    defaultPageSize: data.length,
    extraCellProps: { urlPath: baseURL },
    getTdProps: (_: Partial<Store>, rowInfo: RowInfo | undefined, column: Column | undefined) => {
      return {
        onClick: (__: SyntheticEvent, handleOriginal: () => void) => {
          if (rowInfo && column) {
            if (
              column.id === 'jurisdiction_name' &&
              hasChildren(rowInfo, parentNodes, 'jurisdiction_id')
            ) {
              setJurisdictionId(rowInfo.original.jurisdiction_id);
            }
            if (handleOriginal) {
              handleOriginal();
            }
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
          <IRSIndicatorLegend />
        </Col>
      </Row>
    </div>
  );
};

const defaultProps: GenericJurisdictionProps = {
  currentBaseURL: REPORT_IRS_PLAN_URL,
  currentPageTitle: IRS_REPORTING_TITLE,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: fetchIRSPlans,
  focusAreaColumn: SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS,
  focusAreaLevel: SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  getPlanById: null,
  hasChildren: hasChildrenFunc,
  jurisdictionColumn: SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS,
  jurisdictions: null,
  newFetchPlan: null,
  plan: null,
  reportingPlanSlice: SUPERSET_IRS_REPORTING_PLANS_SLICE,
  service: supersetFetch,
  slices: SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
};

JurisdictionReport.defaultProps = defaultProps;

export { JurisdictionReport };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  currentBaseURL: string;
  currentPageTitle: string;
  focusAreaColumn: string;
  focusAreaLevel: string;
  newFetchPlan: typeof fetchMDAPointPlans | null;
  plan: IRSPlan | null;
  jurisdictionColumn: string;
  jurisdictions: GenericJurisdiction[] | null;
  reportingPlanSlice: string;
  slices: string[];
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: GenericJurisdictionProps & RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const planId = ownProps.match.params.planId || null;
  const { getPlanById } = ownProps;
  let plan = null;
  if (planId) {
    plan = getPlanById ? getPlanById(state, planId) : getIRSPlanById(state, planId);
  }
  let jurisdictions: GenericJurisdiction[] = [];
  const slices = ownProps.slices || defaultProps.slices;
  slices.forEach(
    slice =>
      (jurisdictions = jurisdictions.concat(getGenericJurisdictionsArray(state, slice, planId)))
  );

  const currentBaseURL = ownProps.currentBaseURL || defaultProps.currentBaseURL;
  const currentPageTitle = ownProps.currentPageTitle || defaultProps.currentPageTitle;
  const focusAreaColumn = ownProps.focusAreaColumn || defaultProps.focusAreaColumn;
  const focusAreaLevel = ownProps.focusAreaLevel || defaultProps.focusAreaLevel;
  const jurisdictionColumn = ownProps.jurisdictionColumn || defaultProps.jurisdictionColumn;
  const reportingPlanSlice = ownProps.reportingPlanSlice || defaultProps.reportingPlanSlice;
  const newFetchPlan = ownProps.newFetchPlan || defaultProps.newFetchPlan;

  return {
    currentBaseURL,
    currentPageTitle,
    focusAreaColumn,
    focusAreaLevel,
    jurisdictionColumn,
    jurisdictions,
    newFetchPlan,
    plan,
    reportingPlanSlice,
    slices,
  };
};

/** map dispatch to props */
const mapDispatchToProps = {
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: fetchIRSPlans,
};

/** Connected ActiveFI component */
const ConnectedJurisdictionReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionReport);

export default ConnectedJurisdictionReport;
