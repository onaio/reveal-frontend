import { DrillDownTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetAdhocFilterOption } from '@onaio/superset-connector';
import React, { Fragment, useEffect, useState } from 'react';
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
  SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE,
  SUPERSET_MDA_LITE_REPORTING_WARD_SLICE,
} from '../../../../configs/env';
import { MDA_LITE_REPORTING_TITLE } from '../../../../configs/lang';
import { REPORT_MDA_LITE_WARD_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import supervisorReducer, {
  fetchMDALiteSupervisors,
  makeMDALiteSupervisorsArraySelector,
  MDALiteSupervisor,
  MDALiteSupervisorFilters,
  reducerName as supervisorReducerName,
} from '../../../../store/ducks/superset/MDALite/supervisors';
import wardsReducer, {
  fetchMDALiteWards,
  makeMDALiteWardsArraySelector,
  MDALiteWards,
  reducerName as wardsReducerName,
} from '../../../../store/ducks/superset/MDALite/wards';
import { getCddTableProps, supervisorColumns } from './helpers';

/** register the reducers */
reducerRegistry.register(supervisorReducerName, supervisorReducer);
reducerRegistry.register(wardsReducerName, wardsReducer);

/** declear selectors */
const supervisorsArraySelector = makeMDALiteSupervisorsArraySelector();
const makeMDALiteWardsSelector = makeMDALiteWardsArraySelector();

/** MDA-Lite supervisor reports props */
interface MDALiteSupervisorReportsProps {
  fetchSupervisors: typeof fetchMDALiteSupervisors;
  fetchWards: typeof fetchMDALiteWards;
  service: typeof supersetFetch;
  supervisorData: MDALiteSupervisor[];
  wardData: MDALiteWards[];
}

/** MDA-Lite supervisor reports table component */
const MDALiteSupervisorReports = (
  props: MDALiteSupervisorReportsProps & RouteComponentProps<RouteParams>
) => {
  const { supervisorData, wardData, service, fetchWards, fetchSupervisors } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { params } = props.match;
  const { planId, jurisdictionId, supervisorId } = params;
  const wardName = wardData[0]?.ward_name;

  async function loadData() {
    setLoading(supervisorData.length < 1);
    try {
      const planIdFilter: SupersetAdhocFilterOption[] = [];
      const jurisdictionFilter: SupersetAdhocFilterOption[] = [];
      if (jurisdictionId) {
        jurisdictionFilter.push({
          comparator: jurisdictionId,
          operator: '==',
          subject: 'base_entity_id',
        });
      }
      if (planId) {
        planIdFilter.push({ comparator: planId, operator: '==', subject: 'plan_id' });
      }
      // get supervisors data
      const fetchDataParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
        ...planIdFilter,
        ...jurisdictionFilter,
      ]);
      await service(SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE, fetchDataParams).then(res =>
        fetchSupervisors(res)
      );
      // get ward data
      if (!wardData.length) {
        await service(SUPERSET_MDA_LITE_REPORTING_WARD_SLICE, fetchDataParams).then(res =>
          fetchWards(res)
        );
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

  if (loading) {
    return <Loading />;
  }

  const currentPage = {
    label: wardName,
    url: '',
  };
  const breadcrumbProps = {
    currentPage,
    pages: [
      {
        label: '...',
        url: `${REPORT_MDA_LITE_WARD_URL}/${planId}/${wardData[0]?.parent_id}`,
      },
    ],
  };
  const currentTitle = wardName
    ? `${MDA_LITE_REPORTING_TITLE}: ${wardName}`
    : MDA_LITE_REPORTING_TITLE;

  // table props
  const tableProps = getCddTableProps(supervisorColumns, supervisorData, props);
  return (
    <Fragment>
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
    </Fragment>
  );
};

/** default props */
const defaultProps: MDALiteSupervisorReportsProps = {
  fetchSupervisors: fetchMDALiteSupervisors,
  fetchWards: fetchMDALiteWards,
  service: supersetFetch,
  supervisorData: [],
  wardData: [],
};

MDALiteSupervisorReports.defaultProps = defaultProps;

export { MDALiteSupervisorReports };

/** map dispatch to props */
const mapDispatchToProps = {
  fetchSupervisors: fetchMDALiteSupervisors,
  fetchWards: fetchMDALiteWards,
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
  const wardData = makeMDALiteWardsSelector(state, {
    base_entity_id: jurisdictionId,
    plan_id: planId,
  });
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
