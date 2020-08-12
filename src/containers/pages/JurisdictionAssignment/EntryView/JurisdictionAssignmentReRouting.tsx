/** this is the component that abstracts the functionality that
 * decides based on the below metrics whether to use the auto-selection functionality
 * or the manual jurisdiction selection.
 *  for manual jurisdiction selection:
 *      - plan has more than one assigned jurisdiction.
 *      - if plan has one assigned jurisdiction that is not the rootNodes id.
 *  otherwise redirect to autoSelection url for autoSelection flow.
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import Ripple from '../../../../components/page/Loading';
import {
  ENABLE_JURISDICTION_AUTO_SELECTION_FOR_PLAN_TYPES,
  ENABLE_JURISDICTIONS_AUTO_SELECTION,
} from '../../../../configs/env';
import { PlanDefinition } from '../../../../configs/settings';
import {
  AUTO_ASSIGN_JURISDICTIONS_URL,
  MANUAL_ASSIGN_JURISDICTIONS_URL,
} from '../../../../constants';
import { useLoadingReducer } from '../../../../helpers/useLoadingReducer';
import { isPlanDefinitionOfType } from '../../../../helpers/utils';
import hierarchyReducer, {
  fetchTree,
  getTreeById,
  reducerName as hierarchyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { InterventionType } from '../../../../store/ducks/plans';
import { useHandleBrokenPage } from '../helpers/utils';
import { useGetJurisdictionTree } from './utils';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for the Jurisdiction selector table component */
export interface JurisdictionAssignmentReRoutingProps {
  rootJurisdictionId: string;
  tree?: TreeNode;
  plan: PlanDefinition;
  treeFetchedCreator: typeof fetchTree;
}

const defaultProps = {
  treeFetchedCreator: fetchTree,
};

/** decide which url to go to next
 * @param plan - the plan
 * @param tree - the tree starting from the rootJurisdiction that the plan is in
 */
export const getNextUrl = (
  plan: PlanDefinition,
  tree: TreeNode,
  enableAutoSelection: boolean,
  enabledForPlanTypes: string[]
) => {
  // if autoSelection is disabled we do not need any more checks
  if (!enableAutoSelection) {
    return MANUAL_ASSIGN_JURISDICTIONS_URL;
  }

  // auto selection could be disabled for some plan types. if plan type is not in the whitelist
  const whitelistedTypes: InterventionType[] = enabledForPlanTypes as InterventionType[];
  if (!isPlanDefinitionOfType(plan, whitelistedTypes)) {
    return MANUAL_ASSIGN_JURISDICTIONS_URL;
  }

  // if plan does not have at-least one Jurisdiction then the page will break
  const planHasManyJurisdictions = plan.jurisdiction.length > 1;
  if (planHasManyJurisdictions) {
    return MANUAL_ASSIGN_JURISDICTIONS_URL;
  }

  // for the single jurisdiction, is it the rootNode? coz if not then we manual select
  const jurisdiction = plan.jurisdiction[0];
  const jurisdictionIsNotRoot = jurisdiction.code !== tree.model.id;
  if (jurisdictionIsNotRoot) {
    return MANUAL_ASSIGN_JURISDICTIONS_URL;
  }

  return AUTO_ASSIGN_JURISDICTIONS_URL;
};

/** redirects to either manual jurisdiction selection or auto-jurisdiction selection */
const JurisdictionAssignmentReRouting = (props: JurisdictionAssignmentReRoutingProps) => {
  const { plan, tree, rootJurisdictionId, treeFetchedCreator } = props;
  const { errorMessage, handleBrokenPage, broken } = useHandleBrokenPage();
  const initialLoadingState = !tree;
  const { startLoading, stopLoading, loading } = useLoadingReducer(initialLoadingState);

  useGetJurisdictionTree(
    rootJurisdictionId,
    startLoading,
    treeFetchedCreator,
    stopLoading,
    handleBrokenPage,
    tree
  );

  if (loading()) {
    return <Ripple />;
  }

  if (!tree) {
    return null;
  }

  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  const nextBaseUrl = getNextUrl(
    plan,
    tree,
    ENABLE_JURISDICTIONS_AUTO_SELECTION,
    ENABLE_JURISDICTION_AUTO_SELECTION_FOR_PLAN_TYPES
  );

  return <Redirect to={`${nextBaseUrl}/${plan.identifier}/${rootJurisdictionId}`} />;
};

JurisdictionAssignmentReRouting.defaultProps = defaultProps;
export { JurisdictionAssignmentReRouting };

/** describe props mapped to store */
type MapStateToProps = Pick<JurisdictionAssignmentReRoutingProps, 'tree'>;

/** map action creators interface */
type DispatchToProps = Pick<JurisdictionAssignmentReRoutingProps, 'treeFetchedCreator'>;

const treeSelector = getTreeById();

/** map state to Props
 * @param state - the store
 * @param ownProps - components props
 */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionAssignmentReRoutingProps
): MapStateToProps => {
  return {
    tree: treeSelector(state, {
      rootJurisdictionId: ownProps.rootJurisdictionId,
    }),
  };
};

/** maps action creators */
const mapDispatchToProps: DispatchToProps = {
  treeFetchedCreator: fetchTree,
};

export const ConnectedJurisdictionAssignmentReRouting = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionAssignmentReRouting);
