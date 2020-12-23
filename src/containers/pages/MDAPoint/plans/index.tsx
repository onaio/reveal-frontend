import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import {
  HIDDEN_PLAN_STATUSES,
  SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE,
} from '../../../../configs/env';
import { MDA_POINT_PLANS } from '../../../../configs/lang';
import { QUERY_PARAM_TITLE, REPORT_MDA_POINT_PLAN_URL } from '../../../../constants';
import { getPlanStatusToDisplay, getQueryParams, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import GenericPlansReducer, {
  genericFetchPlans,
  GenericPlan,
  makeGenericPlansArraySelector,
  reducerName as genericReducerName,
} from '../../../../store/ducks/generic/plans';
import { InterventionType } from '../../../../store/ducks/plans';
import { GenericPlanListProps, GenericPlansList } from '../../GenericPlansList';

/** register the MDA plan definitions reducer */
reducerRegistry.register(genericReducerName, GenericPlansReducer);

/** a list of plan statuses to be displayed */
const allowedPlanStatusList = getPlanStatusToDisplay(HIDDEN_PLAN_STATUSES);

/** selector for MDA point plans */
const makeMDAPointPlansArraySelector = makeGenericPlansArraySelector();

/** Simple component that loads a preview list of MDA plans */
const MDAPointPlansList = (props: GenericPlanListProps & RouteComponentProps) => {
  return (
    <div>
      <GenericPlansList {...props} />
    </div>
  );
};

/** Declare default props for MDAPointPlansList */
const defaultProps: GenericPlanListProps = {
  fetchPlans: genericFetchPlans,
  pageTitle: MDA_POINT_PLANS,
  pageUrl: REPORT_MDA_POINT_PLAN_URL,
  plans: [],
  service: supersetFetch,
  supersetReportingSlice: SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE,
};

MDAPointPlansList.defaultProps = defaultProps;

export { MDAPointPlansList };

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
  const MDAPointPlansArray = makeMDAPointPlansArraySelector(state, {
    interventionTypes: [InterventionType.MDAPoint],
    plan_title: searchedTitle,
    statusList: allowedPlanStatusList,
  });

  return {
    ...ownProps,
    plans: MDAPointPlansArray,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: genericFetchPlans };

/** Connected ActiveFI component */
const ConnectedMDAPointPlansList = connect(mapStateToProps, mapDispatchToProps)(MDAPointPlansList);

export default ConnectedMDAPointPlansList;
