import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  HOME,
  HOME_URL,
  INTERVENTION_IRS_URL,
  IRS_REPORTING_TITLE,
  REPORT_IRS_PLAN_URL,
} from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';
import { getJurisdictionById, Jurisdiction } from '../../../../../store/ducks/jurisdictions';
import { getPlanRecordById, PlanRecord } from '../../../../../store/ducks/plans';

/** interface to describe props for IrsReportMap component */
export interface IrsReportMapProps {
  jurisdictionById: Jurisdiction | null;
  jurisdictionId: string;
  planById: PlanRecord | null;
  planId: string;
}

/** default props for IrsReportMap component */
export const defaultIrsReportMapProps = {
  jurisdictionById: null,
  jurisdictionId: '',
  planById: null,
  planId: '',
};

/** Reporting Map for Single Active IRS Plan-Jurisdiction */
class IrsReportMap extends React.Component<
  RouteComponentProps<RouteParams> & IrsReportMapProps,
  {}
> {
  public static defaultProps = defaultIrsReportMapProps;

  public render() {
    const { jurisdictionById, planById, planId } = this.props;

    // Build page-level Breadcrumbs
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: (jurisdictionById && (jurisdictionById.name || 'Village')) || 'Loading...',
      },
      pages: [
        {
          label: HOME,
          url: HOME_URL,
        },
        {
          label: IRS_REPORTING_TITLE,
          url: INTERVENTION_IRS_URL,
        },
        {
          label: (planById && planById.plan_title) || 'Loading...',
          url: `${REPORT_IRS_PLAN_URL}/${planId}`,
        },
      ],
    };

    return (
      <div className="mb-5">
        <Helmet>
          <title>IRS Reporting Map</title>
        </Helmet>
        <Row>
          <Col>
            <HeaderBreadcrumbs {...breadCrumbProps} />
            <h2 className="page-title">
              {(jurisdictionById && jurisdictionById.name) || 'Village'}
            </h2>
          </Col>
        </Row>
      </div>
    );
  }
}

export { IrsReportMap };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - props on the component
 * @returns {IrsReportMapProps}
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): IrsReportMapProps => {
  const jurisdictionId = ownProps.match.params.jurisdictionId || '';
  const jurisdictionById = getJurisdictionById(state, jurisdictionId);
  const planId = ownProps.match.params.id || '';
  const planById = planId.length ? getPlanRecordById(state, planId) : null;
  const props = {
    jurisdictionById,
    jurisdictionId,
    planById,
    planId,
    ...ownProps,
  };
  return props as IrsReportMapProps;
};

/** Create connected IrsReportMap */
const ConnectedIrsReportMap = connect(mapStateToProps)(IrsReportMap);

export default ConnectedIrsReportMap;
