/** this is the view that will be served on assignJurisdictions route
 * it makes service calls for the information that is required to make a decision on whether
 * to got to autoSelection or manual jurisdiction selection. This are:
 *  - the plan
 *  - the hierarchy
 */

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
import { FetchedTreeAction, fetchTree } from '../../../../store/ducks/opensrp/hierarchies';
import {
  addPlanDefinition,
  AddPlanDefinitionAction,
  getPlanDefinitionById,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { useHandleBrokenPage } from '../helpers/utils';
import { ConnectedJurisdictionAssignmentReRouting } from './JurisdictionAssignmentReRouting';
import { useGetJurisdictionTree, useGetRootJurisdictionId, usePlanEffect } from './utils';

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
  useGetJurisdictionTree(
    rootJurisdictionId,
    startLoading,
    treeFetchedCreator,
    stopLoading,
    handleBrokenPage
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
