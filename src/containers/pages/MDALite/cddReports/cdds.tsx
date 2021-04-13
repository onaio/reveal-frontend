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
  SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE,
  SUPERSET_MDA_LITE_REPORTING_WARD_SLICE,
} from '../../../../configs/env';
import { MDA_LITE_REPORTING_TITLE } from '../../../../configs/lang';
import { REPORT_MDA_LITE_CDD_REPORT_URL, REPORT_MDA_LITE_WARD_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import cddReducer, {
  fetchMDALiteCDDs,
  makeMDALiteCDDsArraySelector,
  MDALiteCDDData,
  MDALiteCDDFilters,
  reducerName as cddReducerName,
} from '../../../../store/ducks/superset/MDALite/cdd';
import wardsReducer, {
  fetchMDALiteWards,
  makeMDALiteWardsArraySelector,
  MDALiteWards,
  reducerName as wardsReducerName,
} from '../../../../store/ducks/superset/MDALite/wards';
import { cddReportColumns, getCddTableProps } from './helpers';

/** register the reducers */
reducerRegistry.register(cddReducerName, cddReducer);
reducerRegistry.register(wardsReducerName, wardsReducer);

/** declear selectors */
const CDDsArraySelector = makeMDALiteCDDsArraySelector();
const makeMDALiteWardsSelector = makeMDALiteWardsArraySelector();

/** MDA Lite CDD report props */
interface MDALiteCddReportsProps {
  cddData: MDALiteCDDData[];
  fetchCDDs: typeof fetchMDALiteCDDs;
  fetchWards: typeof fetchMDALiteWards;
  service: typeof supersetFetch;
  wardData: MDALiteWards[];
}

/** Component for displaying MDA Lite CDD Reports */
const MDALiteCddReports = (props: MDALiteCddReportsProps & RouteComponentProps<RouteParams>) => {
  const { cddData, wardData, service, fetchCDDs, fetchWards } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { params } = props.match;
  const { planId, jurisdictionId, supervisorId } = params;
  const supervisorName = (cddData[0]?.supervisor_name || supervisorId) as string;

  async function loadData() {
    setLoading(cddData.length < 1);
    try {
      const planIdFilter: SupersetAdhocFilterOption[] = [];
      const jurisdictionFilter: SupersetAdhocFilterOption[] = [];
      const supervisorFilter: SupersetAdhocFilterOption[] = [];
      if (jurisdictionId && supervisorId && planId) {
        jurisdictionFilter.push({
          comparator: jurisdictionId,
          operator: '==',
          subject: 'base_entity_id',
        });
        planIdFilter.push({ comparator: planId, operator: '==', subject: 'plan_id' });
        supervisorFilter.push({
          comparator: supervisorId,
          operator: '==',
          subject: 'supervisor_id',
        });
        // get cdd data
        const fetchCDDParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          ...planIdFilter,
          ...jurisdictionFilter,
          ...supervisorFilter,
        ]);
        await service(SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE, fetchCDDParams).then(res =>
          fetchCDDs(res)
        );
        // get ward data
        const fetchWardParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          ...planIdFilter,
          ...jurisdictionFilter,
        ]);
        if (!wardData.length) {
          await service(SUPERSET_MDA_LITE_REPORTING_WARD_SLICE, fetchWardParams).then(res =>
            fetchWards(res)
          );
        }
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
    label: supervisorName,
    url: `${REPORT_MDA_LITE_CDD_REPORT_URL}/${planId}/${jurisdictionId}/${supervisorId}`,
  };
  const breadcrumbProps = {
    currentPage,
    pages: [
      {
        label: '...',
        url: `${REPORT_MDA_LITE_WARD_URL}/${planId}/${wardData[0]?.parent_id}`,
      },
      {
        label: wardData[0]?.ward_name || '...',
        url: `${REPORT_MDA_LITE_CDD_REPORT_URL}/${planId}/${jurisdictionId}`,
      },
    ],
  };
  const currentTitle = supervisorName
    ? `${MDA_LITE_REPORTING_TITLE}: ${supervisorName}`
    : MDA_LITE_REPORTING_TITLE;

  // table props
  const tableProps = getCddTableProps(cddReportColumns, cddData, props);

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
const defaultProps: MDALiteCddReportsProps = {
  cddData: [],
  fetchCDDs: fetchMDALiteCDDs,
  fetchWards: fetchMDALiteWards,
  service: supersetFetch,
  wardData: [],
};

MDALiteCddReports.defaultProps = defaultProps;

export { MDALiteCddReports };

/** map dispatch to props */
const mapDispatchToProps = {
  fetchCDDs: fetchMDALiteCDDs,
  fetchWards: fetchMDALiteWards,
};

/** Dispatched State Props  */
type DispatchedStateProps = Pick<MDALiteCddReportsProps, 'cddData' | 'wardData'>;

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { params } = ownProps.match;
  const { planId, jurisdictionId, supervisorId } = params;
  const cddFilters: MDALiteCDDFilters = {
    base_entity_id: jurisdictionId,
    plan_id: planId,
    supervisor_id: supervisorId,
  };
  const cddData = CDDsArraySelector(state, cddFilters);
  const wardData = makeMDALiteWardsSelector(state, {
    base_entity_id: jurisdictionId,
    plan_id: planId,
  });
  return {
    cddData,
    wardData,
  };
};

/** Connected MDALiteCddReports component */
const ConnectedMDALiteCddReports = connect(mapStateToProps, mapDispatchToProps)(MDALiteCddReports);

export default ConnectedMDALiteCddReports;
