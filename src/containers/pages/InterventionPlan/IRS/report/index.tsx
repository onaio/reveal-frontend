import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import {
  HOME,
  HOME_URL,
  INTERVENTION_IRS_URL,
  IRS_REPORTING_TITLE,
} from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';
import { getPlanRecordById, PlanRecord } from '../../../../../store/ducks/plans';

/** interface to describe props for IrsReport component */
export interface IrsReportProps {
  planById: PlanRecord | null;
  planId: string;
}

/** default props for IrsReport component */
export const defaultIrsReportProps: IrsReportProps = {
  planById: null,
  planId: '',
};

/** Reporting for Single Active IRS Plan */
class IrsReport extends React.Component<RouteComponentProps<RouteParams> & IrsReportProps, {}> {
  public static defaultProps = defaultIrsReportProps;

  public render() {
    const { planById, planId } = this.props;

    // Build Breadcrumbs
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: (planById && planById.plan_title) || 'Loading...',
      },
      pages: [
        homePage,
        {
          label: IRS_REPORTING_TITLE,
          url: INTERVENTION_IRS_URL,
        },
      ],
    };

    if (!planById) {
      return (
        <div className="mb-5">
          <Helmet>
            <title>Plan Not Found</title>
          </Helmet>
          <HeaderBreadcrumbs {...breadCrumbProps} />
          <h2 className="page-title">Loading Plan: {planId}</h2>
          <Loading />
        </div>
      );
    }

    return (
      <div className="mb-5">
        <Helmet>
          <title>IRS Reporting | {planById.plan_title}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">IRS Plan: {planById.plan_title}</h2>
      </div>
    );
  }
}

export { IrsReport };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - props on the component
 * @returns {IrsReportProps}
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): IrsReportProps => {
  const planId = ownProps.match.params.id || '';
  const planById = planId.length ? getPlanRecordById(state, planId) : null;
  const props = {
    planById,
    planId,
    ...ownProps,
  };

  return props as IrsReportProps;
};

/** Create connected IrsReport */
const ConnectedIrsReport = connect(mapStateToProps)(IrsReport);

export default ConnectedIrsReport;
