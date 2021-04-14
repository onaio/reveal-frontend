import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { Fragment, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { DrillDownTable } from '@onaio/drill-down-table';
import superset, { SupersetAdhocFilterOption } from '@onaio/superset-connector';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import {
  SUPERSET_MAX_RECORDS,
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE,
  SUPERSET_MDA_LITE_REPORTING_WARD_SLICE,
} from '../../../../configs/env';
import { HOME, MDA_LITE_REPORTING_TITLE, SUBCOUNTY_LABEL } from '../../../../configs/lang';
import { HOME_URL, REPORT_MDA_LITE_PLAN_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getAllGenericJurisdictionByJurisdictionId,
  reducerName as genericJurisdictionsReducerName,
} from '../../../../store/ducks/generic/jurisdictions';
import GenericPlansReducer, {
  genericFetchPlans,
  GenericPlan,
  getPlanByIdSelector,
  reducerName as genericPlanReducerName,
} from '../../../../store/ducks/generic/plans';
import wardReducer, {
  fetchMDALiteWards,
  makeMDALiteWardsArraySelector,
  MDALiteWards,
  reducerName as wardReducerName,
} from '../../../../store/ducks/superset/MDALite/wards';
import { wardColumns } from './helpers';

/** register the reducers */
reducerRegistry.register(genericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericPlanReducerName, GenericPlansReducer);
reducerRegistry.register(wardReducerName, wardReducer);

/** selectors */
const makeMDALiteWardsSelector = makeMDALiteWardsArraySelector();

interface MDALiteWardsrReportsProps {
  baseUrl: string;
  fetchJurisdictions: typeof fetchGenericJurisdictions;
  fetchPlans: typeof genericFetchPlans;
  fetchWards: typeof fetchMDALiteWards;
  planData: GenericPlan | null;
  service: typeof supersetFetch;
  slices: string[];
  subcountyData: GenericJurisdiction[];
  wardData: MDALiteWards[];
}

/** Component for showing MDA Lite ward reports */
const MDALiteWardsReport = (
  props: MDALiteWardsrReportsProps & RouteComponentProps<RouteParams>
) => {
  const {
    wardData,
    service,
    fetchWards,
    fetchPlans,
    planData,
    subcountyData,
    slices,
    fetchJurisdictions,
    baseUrl,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const { params } = props.match;
  const { planId, jurisdictionId } = params;

  // load data
  async function loadData() {
    setLoading(!wardData || (wardData && wardData.length < 1));
    try {
      const parentJurFilter: SupersetAdhocFilterOption[] = [];
      const planIdFilter: SupersetAdhocFilterOption[] = [];
      const jurisdictionFilter: SupersetAdhocFilterOption[] = [];
      if (jurisdictionId) {
        jurisdictionFilter.push({
          comparator: jurisdictionId,
          operator: '==',
          subject: 'jurisdiction_id',
        });
        parentJurFilter.push({ comparator: jurisdictionId, operator: '==', subject: 'parent_id' });
      }
      if (planId) {
        planIdFilter.push({ comparator: planId, operator: '==', subject: 'plan_id' });
      }
      // get ward data
      const wardDataFilters = superset.getFormData(SUPERSET_MAX_RECORDS, [
        ...planIdFilter,
        ...parentJurFilter,
      ]);
      await service(SUPERSET_MDA_LITE_REPORTING_WARD_SLICE, wardDataFilters).then(res =>
        fetchWards(res)
      );
      // get plan data
      if (!planData) {
        const planDataFilter = superset.getFormData(SUPERSET_MAX_RECORDS, [...planIdFilter]);
        await service(SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE, planDataFilter).then(res =>
          fetchPlans(res)
        );
      }
      if (!subcountyData.length) {
        const subCountyFilters = superset.getFormData(SUPERSET_MAX_RECORDS, [
          ...planIdFilter,
          ...jurisdictionFilter,
        ]);
        slices.forEach(async slice => {
          await service(slice, subCountyFilters).then(res => fetchJurisdictions(slice, res));
        });
      }
    } catch (e) {
      displayError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, [planId, jurisdictionId]);

  if (loading) {
    return <Loading />;
  }

  const jurBreadcrumb = [];
  if (planData && subcountyData.length) {
    jurBreadcrumb.push({
      label: planData.plan_title,
      url: `${baseUrl}/${planData.plan_id}`,
    });
    const paths = subcountyData[0].jurisdiction_path;
    const names = subcountyData[0].jurisdiction_name_path;
    if (paths?.length && names?.length) {
      paths.forEach((_, index) => {
        jurBreadcrumb.push({
          label: names[index],
          url: `${baseUrl}/${planData.plan_id}/${paths[index]}`,
        });
      });
    }
  }

  const currentPage = {
    label: subcountyData[0]?.jurisdiction_name || SUBCOUNTY_LABEL,
    url: '',
  };

  const pageTitle = `${MDA_LITE_REPORTING_TITLE}: ${currentPage.label}`;
  const breadcrumbProps = {
    currentPage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: MDA_LITE_REPORTING_TITLE,
        url: baseUrl,
      },
      ...jurBreadcrumb,
    ],
  };

  const tableProps = {
    columns: wardColumns,
    data: wardData || [],
    paginate: true,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      showColumnHider: false,
      showRowHeightPicker: false,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
    resize: true,
    useDrillDown: false,
  };

  return (
    <Fragment>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{pageTitle}</h3>
          <div className="generic-report-table">
            <DrillDownTable {...tableProps} />
          </div>
        </Col>
      </Row>
    </Fragment>
  );
};

const defaultProps: MDALiteWardsrReportsProps = {
  baseUrl: REPORT_MDA_LITE_PLAN_URL,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  fetchWards: fetchMDALiteWards,
  planData: null,
  service: supersetFetch,
  slices: SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
  subcountyData: [],
  wardData: [],
};

MDALiteWardsReport.defaultProps = defaultProps;
export { MDALiteWardsReport };

/** map dispatch to props */
const mapDispatchToProps = {
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  fetchWards: fetchMDALiteWards,
};

type DispatchedStateProps = Pick<
  MDALiteWardsrReportsProps,
  'planData' | 'wardData' | 'subcountyData'
>;

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { params } = ownProps.match;
  const { planId, jurisdictionId } = params;
  const planData = planId ? getPlanByIdSelector(state, planId) : null;
  const wardData = makeMDALiteWardsSelector(state, {
    parent_id: jurisdictionId,
    plan_id: planId,
  });
  let subcountyData: GenericJurisdiction[] = [];
  if (jurisdictionId) {
    defaultProps.slices.forEach((slice: string) => {
      const jurs = getAllGenericJurisdictionByJurisdictionId(state, slice, jurisdictionId);
      if (jurs.length) {
        const jursOfInterest = jurs.filter(jur => jur.plan_id === planId);
        subcountyData = [...subcountyData, ...jursOfInterest];
      }
    });
  }
  return {
    planData,
    subcountyData,
    wardData,
  };
};

/** Connected MDALiteWardsReport component */
const ConnectedMDALiteWardsReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(MDALiteWardsReport);

export default ConnectedMDALiteWardsReport;
