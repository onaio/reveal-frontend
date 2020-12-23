import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { HIDDEN_PLAN_STATUSES, SUPERSET_SMC_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { SMC_PLANS } from '../../../../configs/lang';
import { QUERY_PARAM_TITLE, REPORT_SMC_PLAN_URL } from '../../../../constants';
import { getPlanStatusToDisplay, getQueryParams } from '../../../../helpers/utils';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import SMCPlansReducer, {
  fetchSMCPlans,
  makeSMCPlansArraySelector,
  reducerName as SMCPlansReducerName,
  SMCPLANType,
} from '../../../../store/ducks/generic/SMCPlans';
import { GenericPlanListProps, GenericPlansList } from '../../GenericPlansList';

/** register the SMC plan definitions reducer */
reducerRegistry.register(SMCPlansReducerName, SMCPlansReducer);

/** a list of plan statuses to be displayed */
const allowedPlanStatusList = getPlanStatusToDisplay(HIDDEN_PLAN_STATUSES);
// store.dispatch(fetchSMCPlans(testlans as any))

/** Simple component that loads a preview list of SMC plans */
const SMCPlansList = (props: GenericPlanListProps & RouteComponentProps) => {
  return (
    <div>
      <GenericPlansList {...props} />
    </div>
  );
};

/** Declare default props for SMCPlansList */
const defaultProps: GenericPlanListProps = {
  fetchPlans: fetchSMCPlans,
  pageTitle: SMC_PLANS,
  pageUrl: REPORT_SMC_PLAN_URL,
  plans: [],
  service: supersetFetch,
  supersetReportingSlice: SUPERSET_SMC_REPORTING_PLANS_SLICE,
};

SMCPlansList.defaultProps = defaultProps;

export { SMCPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps extends RouteComponentProps<RouteParams> {
  plans: SMCPLANType[];
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const SMCPlansArray = makeSMCPlansArraySelector()(state, {
    plan_title: searchedTitle,
    statusList: allowedPlanStatusList,
  });

  return {
    ...ownProps,
    plans: SMCPlansArray,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchSMCPlans };

/** Connected ActiveFI component */
const ConnectedSMCPlansList = connect(mapStateToProps, mapDispatchToProps)(SMCPlansList);

export default ConnectedSMCPlansList;
