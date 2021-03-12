import { DrillDownTable } from '@onaio/drill-down-table/dist/types';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE,
} from '../../../../configs/env';
import { HOME, MDA_LITE_REPORTING_TITLE } from '../../../../configs/lang';
import { HOME_URL, REPORT_MDA_LITE_PLAN_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import { GenericJurisdiction } from '../../../../store/ducks/generic/jurisdictions';
import { getCddTableProps, supervisorColumns } from './helpers';

interface MDALiteSupervisorReportsProps {
  service: typeof supersetFetch;
  supervisorData: any[];
  wardData: GenericJurisdiction[];
}

const MDALiteSupervisorReports = (
  props: MDALiteSupervisorReportsProps & RouteComponentProps<RouteParams>
) => {
  const { supervisorData, wardData, service } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { params } = props.match;
  const { planId, jurisdictionId, supervisorId } = params;
  const wardName = wardData[0].jurisdiction_name;

  async function loadData() {
    setLoading(supervisorData.length < 1);
    try {
      if (planId && jurisdictionId) {
        await service(SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE);
      }
      if (planId && jurisdictionId && wardData.length) {
        const slices = SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');
        await service(slices[0]);
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
    url: `${REPORT_MDA_LITE_PLAN_URL}/${planId}/${wardData[0].jurisdiction_parent_id}`,
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
        label: wardData[0].jurisdiction_name,
        url: `${REPORT_MDA_LITE_PLAN_URL}/${planId}/${wardData[0].jurisdiction_parent_id}`,
      },
    ],
  };
  const currentTitle = wardName
    ? `${MDA_LITE_REPORTING_TITLE}: ${wardName}`
    : MDA_LITE_REPORTING_TITLE;

  // table props
  const tableProps = getCddTableProps(supervisorColumns, supervisorData);

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
  service: supersetFetch,
  supervisorData: [],
  wardData: [],
};

MDALiteSupervisorReports.defaultProps = defaultProps;

export { MDALiteSupervisorReports };
