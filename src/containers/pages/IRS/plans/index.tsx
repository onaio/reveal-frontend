import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { IRS_PLANS } from '../../../../configs/lang';
import { QUERY_PARAM_TITLE, REPORT_IRS_PLAN_URL } from '../../../../constants';
import { getQueryParams, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import IRSPlansReducer, {
  fetchIRSPlans,
  GenericPlan,
  makeIRSPlansArraySelector,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import { GenericPlanListProps, GenericPlansList } from '../../GenericPlansList';

/** register the IRS plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

/** interface for IRS PlanList props */
interface PlanListProps extends GenericPlanListProps {
  ownProps: any;
}

/** Simple component that loads a privew list of IRS plans */
const IRSPlansList = (props: PlanListProps & RouteComponentProps) => {
  return (
    <div>
      <GenericPlansList {...props} />
    </div>
  );
};

/** Declare default props for IRSPlansList */
const defaultProps: PlanListProps = {
  fetchPlans: fetchIRSPlans,
  ownProps: {},
  pageTitle: IRS_PLANS,
  pageUrl: REPORT_IRS_PLAN_URL,
  plans: [],
  service: supersetFetch,
  supersetReportingSlice: SUPERSET_IRS_REPORTING_PLANS_SLICE,
};

IRSPlansList.defaultProps = defaultProps;

export { IRSPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps extends RouteComponentProps<RouteParams> {
  plans: GenericPlan[];
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const plans = makeIRSPlansArraySelector()(state, { plan_title: searchedTitle });

  return {
    ...ownProps,
    plans,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchIRSPlans };

/** Connected ActiveFI component */
const ConnectedIRSPlansList = connect(mapStateToProps, mapDispatchToProps)(IRSPlansList);

export default ConnectedIRSPlansList;
