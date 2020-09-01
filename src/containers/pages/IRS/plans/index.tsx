import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { HIDDEN_PLAN_STATUSES, SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { IRS_PLANS } from '../../../../configs/lang';
import { QUERY_PARAM_TITLE, REPORT_IRS_PLAN_URL } from '../../../../constants';
import { getPlanStatusToDisplay, getQueryParams, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import GenericPLansReducer, {
  genericFetchPlans,
  GenericPlan,
  makeGenericPlansArraySelector,
  reducerName as GenericPLansReducerName,
} from '../../../../store/ducks/generic/plans';
import { InterventionType } from '../../../../store/ducks/plans';
import { GenericPlanListProps, GenericPlansList } from '../../GenericPlansList';

/** register the IRS plan definitions reducer */
reducerRegistry.register(GenericPLansReducerName, GenericPLansReducer);

/** a list of plan statuses to be displayed */
const allowedPlanStatusList = getPlanStatusToDisplay(HIDDEN_PLAN_STATUSES);

/** selector for IRS plans */
const makeIRSPlansArraySelector = makeGenericPlansArraySelector();

/** Simple component that loads a preview list of IRS plans */
const IRSPlansList = (props: GenericPlanListProps & RouteComponentProps) => {
  return (
    <div>
      <GenericPlansList {...props} />
    </div>
  );
};

/** Declare default props for IRSPlansList */
const defaultProps: GenericPlanListProps = {
  fetchPlans: genericFetchPlans,
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
  const plans = makeIRSPlansArraySelector(state, {
    interventionTypes: [InterventionType.IRS, InterventionType.DynamicIRS],
    plan_title: searchedTitle,
    statusList: allowedPlanStatusList,
  });

  return {
    ...ownProps,
    plans,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: genericFetchPlans };

/** Connected ActiveFI component */
const ConnectedIRSPlansList = connect(mapStateToProps, mapDispatchToProps)(IRSPlansList);

export default ConnectedIRSPlansList;
