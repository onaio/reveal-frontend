import { DrillDownTable } from '@onaio/drill-down-table/dist/types';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import {
  SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE,
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE,
} from '../../../../configs/env';
import { HOME, MDA_LITE_REPORTING_TITLE } from '../../../../configs/lang';
import {
  HOME_URL,
  QUERY_PARAM_TITLE,
  REPORT_MDA_LITE_CDD_REPORT_URL,
  REPORT_MDA_LITE_PLAN_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import { GenericJurisdiction } from '../../../../store/ducks/generic/jurisdictions';
import { cddReportColumns } from './helpers';

interface MDALiteCddReportsProps {
  cddData: any[];
  service: typeof supersetFetch;
  supervisorData: any[];
  wardData: GenericJurisdiction[];
}

const MDALiteCddReportsProps = (
  props: MDALiteCddReportsProps & RouteComponentProps<RouteParams>
) => {
  const { cddData, supervisorData, wardData, service } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { params } = props.match;
  const { planId, jurisdictionId, supervisorId } = params;
  const supervisorName = supervisorData[0].name || cddData[0].supervisor_name;

  async function loadData() {
    setLoading(cddData.length < 1);
    try {
      if (planId && jurisdictionId && !supervisorData.length) {
        await service(SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE);
      }
      if (planId && jurisdictionId && wardData.length) {
        const slices = SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');
        await service(slices[0]);
      }
      if (planId && jurisdictionId && supervisorId) {
        await service(SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE);
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
    label: supervisorName,
    url: `${REPORT_MDA_LITE_CDD_REPORT_URL}/${planId}/${jurisdictionId}/${supervisorId}`,
  };
  const breadcrumbProps = {
    currentPage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: wardData[0].jurisdiction_name,
        url: `${REPORT_MDA_LITE_PLAN_URL}/${planId}/${wardData[0].jurisdiction_parent_id}`,
      },
    ],
  };
  const currentTitle = supervisorName
    ? `${MDA_LITE_REPORTING_TITLE}: ${supervisorName}`
    : MDA_LITE_REPORTING_TITLE;

  // table props
  const tableProps = {
    columns: cddReportColumns,
    data: cddData || [],
    identifierField: 'id',
    paginate: false,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      componentProps: props,
      queryParam: QUERY_PARAM_TITLE,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
    resize: true,
    useDrillDown: false,
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <Helmet>
        <title>currentTitle</title>
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
const defaultProps: MDALiteCddReportsProps = {
  cddData: [],
  service: supersetFetch,
  supervisorData: [],
  wardData: [],
};

MDALiteCddReportsProps.defaultProps = defaultProps;

export { MDALiteCddReportsProps as MDALiteCddReports };
