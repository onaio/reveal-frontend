import { DrillDownTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_MAX_RECORDS,
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE,
} from '../../../../configs/env';
import { HOME, MDA_LITE_REPORTING_TITLE } from '../../../../configs/lang';
import {
  HOME_URL,
  REPORT_MDA_LITE_CDD_REPORT_URL,
  REPORT_MDA_LITE_PLAN_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionById,
  reducerName as genericJurisdictionsReducerName,
} from '../../../../store/ducks/generic/jurisdictions';
import supervisorReducer, {
  fetchMDALiteSupervisors,
  makeMDALiteSupervisorsArraySelector,
  MDALiteSupervisor,
  MDALiteSupervisorFilters,
  reducerName as supervisorReducerName,
} from '../../../../store/ducks/superset/MDALite/supervisors';
import { getCddTableProps, supervisorColumns } from './helpers';

/** register the reducers */
reducerRegistry.register(genericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(supervisorReducerName, supervisorReducer);

/** declear selectors */
const supervisorsArraySelector = makeMDALiteSupervisorsArraySelector();

/** MDA-Lite supervisor reports props */
interface MDALiteSupervisorReportsProps {
  fetchJurisdictions: typeof fetchGenericJurisdictions;
  fetchSupervisors: typeof fetchMDALiteSupervisors;
  service: typeof supersetFetch;
  slices: string[];
  supervisorData: MDALiteSupervisor[];
  wardData: GenericJurisdiction[];
}

/** MDA-Lite supervisor reports table component */
const MDALiteSupervisorReports = (
  props: MDALiteSupervisorReportsProps & RouteComponentProps<RouteParams>
) => {
  const { supervisorData, wardData, service, slices, fetchJurisdictions, fetchSupervisors } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { params } = props.match;
  const { planId, jurisdictionId, supervisorId } = params;
  const wardName = wardData[0]?.jurisdiction_name;

  async function loadData() {
    setLoading(supervisorData.length < 1);
    try {
      if (jurisdictionId && !supervisorData.length) {
        const fetchSupervisorParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          { comparator: jurisdictionId, operator: '==', subject: 'ward_id' },
        ]);
        await service(
          SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE,
          fetchSupervisorParams
        ).then(res => fetchSupervisors(res));
      }
      if (planId && jurisdictionId && wardData.length) {
        const fetchWardParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
          { comparator: planId, operator: '==', subject: 'plan_id' },
        ]);
        await service(slices[0], fetchWardParams).then(res => fetchJurisdictions(slices[0], res));
      }
    } catch (e) {
      displayError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, [planId, jurisdictionId, supervisorId]);

  const currentPage = {
    label: wardName,
    url: `${REPORT_MDA_LITE_CDD_REPORT_URL}/${planId}/${wardData[0]?.jurisdiction_id}`,
  };
  const breadcrumbProps = {
    currentPage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      // change to subcounty name
      {
        label: wardData[0]?.jurisdiction_name,
        url: `${REPORT_MDA_LITE_PLAN_URL}/${planId}/${wardData[0]?.jurisdiction_parent_id}`,
      },
    ],
  };
  const currentTitle = wardName
    ? `${MDA_LITE_REPORTING_TITLE}: ${wardName}`
    : MDA_LITE_REPORTING_TITLE;

  // table props
  const tableProps = getCddTableProps(supervisorColumns, supervisorData, props);

  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <Helmet>
        <title>{currentTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{currentTitle}</h3>
          <div className="generic-report-table">
            <DrillDownTable {...tableProps} />
          </div>
          <IRSIndicatorLegend indicatorRows="MDALiteIndicators" />
        </Col>
      </Row>
    </div>
  );
};

/** default props */
const defaultProps: MDALiteSupervisorReportsProps = {
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchSupervisors: fetchMDALiteSupervisors,
  service: supersetFetch,
  slices: SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
  supervisorData: [],
  wardData: [],
};

MDALiteSupervisorReports.defaultProps = defaultProps;

export { MDALiteSupervisorReports };

/** map dispatch to props */
const mapDispatchToProps = {
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchSupervisors: fetchMDALiteSupervisors,
};

/** Dispatched State Props  */
type DispatchedStateProps = Pick<MDALiteSupervisorReportsProps, 'supervisorData' | 'wardData'>;

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { params } = ownProps.match;
  const { planId, jurisdictionId } = params;
  const supervisorFilters: MDALiteSupervisorFilters = {
    base_entity_id: jurisdictionId,
    plan_id: planId,
  };
  const supervisorData = supervisorsArraySelector(state, supervisorFilters);
  const wardData: GenericJurisdiction[] = [];
  if (jurisdictionId) {
    defaultProps.slices.forEach((slice: string) => {
      const jur = getGenericJurisdictionById(state, slice, jurisdictionId);
      if (jur && jur.plan_id === planId) {
        wardData.push(jur);
      }
    });
  }
  return {
    supervisorData,
    wardData,
  };
};

/** Connected MDALiteCddReports component */
const ConnectedMDALiteSupervisorReports = connect(
  mapStateToProps,
  mapDispatchToProps
)(MDALiteSupervisorReports);

export default ConnectedMDALiteSupervisorReports;
