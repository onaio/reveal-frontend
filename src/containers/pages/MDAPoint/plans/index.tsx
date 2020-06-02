import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { MDA_POINT_PLANS } from '../../../../configs/lang';
import { QUERY_PARAM_TITLE, REPORT_MDA_POINT_PLAN_URL } from '../../../../constants';
import { getQueryParams } from '../../../../helpers/utils';
import MDAPointPlansReducer, {
  fetchMDAPointPlans,
  makeMDAPointPlansArraySelector,
  MDAPointPlan,
  reducerName as MDAPointPlansReducerName,
} from '../../../../store/ducks/generic/MDAPointPlan';
import ConnectedIRSPlansList from '../../IRS/plans';

/** register the plan definitions reducer */
reducerRegistry.register(MDAPointPlansReducerName, MDAPointPlansReducer);

/** interface for PlanList props */
interface PlanListProps {
  plans: MDAPointPlan[];
  ownProps: any;
  fetchPlans: typeof fetchMDAPointPlans;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const MDAPointPlansList = (props: PlanListProps & RouteComponentProps) => {
  const { plans, ownProps, fetchPlans } = props;
  const IRSPlansListprops = {
    ...ownProps,
    fetchPlans,
    pageTitle: MDA_POINT_PLANS,
    pageUrl: REPORT_MDA_POINT_PLAN_URL,
    plans,
    supersetReportingSlice: SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE,
  };

  return (
    <div>
      <ConnectedIRSPlansList {...IRSPlansListprops} />
    </div>
  );
};

/** Declare default props for MDAPointPlansList */
const defaultProps: PlanListProps = {
  fetchPlans: fetchMDAPointPlans,
  ownProps: {},
  plans: [],
};

MDAPointPlansList.defaultProps = defaultProps;

export { MDAPointPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  ownProps: any;
  plans: MDAPointPlan[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const MDAPointPlansArray = makeMDAPointPlansArraySelector()(state, { plan_title: searchedTitle });

  return {
    ownProps,
    plans: MDAPointPlansArray,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchMDAPointPlans };

/** Connected ActiveFI component */
const ConnectedMDAPointPlansList = connect(mapStateToProps, mapDispatchToProps)(MDAPointPlansList);

export default ConnectedMDAPointPlansList;
