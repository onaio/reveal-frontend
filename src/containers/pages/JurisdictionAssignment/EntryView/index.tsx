/** this is the view that will be served on assignJurisdictions route
 * it makes service calls for the information that is required to make a decision on whether
 * to got to autoSelection or manual jurisdiction selection. This are:
 *  - the plan
 *  - the rootJurisdiction id - this is used by the child component to service call for the hierarchy
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ActionCreator, Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import Ripple from '../../../../components/page/Loading';
import { COULD_NOT_LOAD_JURISDICTION, COULD_NOT_LOAD_PLAN } from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { useLoadingReducer } from '../../../../helpers/useLoadingReducer';
import { OpenSRPService } from '../../../../services/opensrp';
import hierarchyReducer, {
  FetchedTreeAction,
  fetchTree,
  reducerName as hierarchyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
import planDefinitionReducer, {
  addPlanDefinition,
  AddPlanDefinitionAction,
  getPlanDefinitionById,
  reducerName as planReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { useHandleBrokenPage } from '../helpers/utils';
import { ConnectedJurisdictionAssignmentReRouting } from './JurisdictionAssignmentReRouting';
import { useGetRootJurisdictionId, usePlanEffect } from './utils';

reducerRegistry.register(planReducerName, planDefinitionReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for this component */
interface EntryViewProps {
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: ActionCreator<FetchedTreeAction>;
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
}

const defaultProps = {
  fetchPlanCreator: addPlanDefinition,
  plan: null,
  serviceClass: OpenSRPService,
  treeFetchedCreator: fetchTree,
};

/** this component must be served on a route with a planId param */
export interface EntryViewRouteParams {
  planId: string;
}

export type FullEntryViewProps = EntryViewProps & RouteComponentProps<EntryViewRouteParams>;

/** makes service calls for getting the plan and the hierarchy map
 * and renders component to route to either auto-selection or manual selection
 */
const EntryView = (props: FullEntryViewProps) => {
  const { serviceClass, plan, treeFetchedCreator, fetchPlanCreator } = props;

  const { errorMessage, handleBrokenPage, broken } = useHandleBrokenPage();
  const initialLoadingState = !plan;
  const { startLoading, stopLoading, loading } = useLoadingReducer(initialLoadingState);

  usePlanEffect(
    props.match.params.planId,
    plan,
    serviceClass,
    fetchPlanCreator,
    handleBrokenPage,
    stopLoading,
    startLoading
  );
  const rootJurisdictionId = useGetRootJurisdictionId(
    plan,
    serviceClass,
    handleBrokenPage,
    stopLoading,
    startLoading
  );

  if (loading()) {
    return <Ripple />;
  }
  if (!plan) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_PLAN} />;
  }

  if (!rootJurisdictionId) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_JURISDICTION} />;
  }

  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  const reRoutingProps = {
    plan,
    rootJurisdictionId,
    treeFetchedCreator,
  };

  return <ConnectedJurisdictionAssignmentReRouting {...reRoutingProps} />;
};

EntryView.defaultProps = defaultProps;
export { EntryView as JurisdictionAssignmentEntry };

/** map state to props interface  */
type MapStateToProps = Pick<EntryViewProps, 'plan'>;

/** map action creators interface */
type DispatchToProps = Pick<EntryViewProps, 'treeFetchedCreator' | 'fetchPlanCreator'>;

/** maps props to store state */
const mapStateToProps = (state: Partial<Store>, ownProps: FullEntryViewProps): MapStateToProps => {
  const planId = ownProps.match.params.planId;
  const planObj = getPlanDefinitionById(state, planId);

  return {
    plan: planObj,
  };
};

/** maps action creators */
const mapDispatchToProps: DispatchToProps = {
  fetchPlanCreator: addPlanDefinition,
  treeFetchedCreator: fetchTree,
};

export const ConnectedEntryView = connect(mapStateToProps, mapDispatchToProps)(EntryView);
