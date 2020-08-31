/** the Manual Jurisdiction Selection view
 * Responsibilities:
 *  load plan given a url with the planId
 *  pending : render map.
 *  render table from which a user can assign jurisdictions to the active plan
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ActionCreator, Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Ripple from '../../../../components/page/Loading';
import { ASSIGNMENT_PAGE_SHOW_MAP } from '../../../../configs/env';
import {
  ASSIGN_JURISDICTIONS,
  COULD_NOT_LOAD_JURISDICTION_HIERARCHY,
  COULD_NOT_LOAD_PLAN,
  PLANNING_PAGE_TITLE,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import {
  ASSIGN_JURISDICTIONS_URL,
  MANUAL_ASSIGN_JURISDICTIONS_URL,
  PLANNING_VIEW_URL,
} from '../../../../constants';
import { useLoadingReducer } from '../../../../helpers/useLoadingReducer';
import { OpenSRPService } from '../../../../services/opensrp';
import hierarchyReducer, {
  autoSelectNodes,
  FetchedTreeAction,
  fetchTree,
  getTreeById,
  reducerName as hierarchyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
import { SELECTION_REASON } from '../../../../store/ducks/opensrp/hierarchies/constants';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import jurisdictionMetadataReducer, {
  reducerName as jurisdictionMetadataReducerName,
} from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import plansReducer, {
  addPlanDefinition,
  AddPlanDefinitionAction,
  getPlanDefinitionById,
  reducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { ConnectedAssignmentMapWrapper } from '../../AssigmentMapWrapper';
import { useGetJurisdictionTree, usePlanEffect } from '../EntryView/utils';
import { ConnectedJurisdictionTable } from '../helpers/JurisdictionTable';
import { useHandleBrokenPage } from '../helpers/utils';

reducerRegistry.register(reducerName, plansReducer);
reducerRegistry.register(jurisdictionMetadataReducerName, jurisdictionMetadataReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** this component's props */
export interface JurisdictionAssignmentViewProps {
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: ActionCreator<FetchedTreeAction>;
  autoSelectNodesCreator: typeof autoSelectNodes;
  tree?: TreeNode;
}

export const defaultProps = {
  autoSelectNodesCreator: autoSelectNodes,
  fetchPlanCreator: addPlanDefinition,
  plan: null,
  serviceClass: OpenSRPService,
  treeFetchedCreator: fetchTree,
};

/** view will require a planId from the url */
export interface RouteParams {
  planId: string;
  rootId: string;
  parentId?: string;
}

/** full props with route props added for JurisdictionAssignmentView */
export type JurisdictionAssignmentViewFullProps = JurisdictionAssignmentViewProps &
  RouteComponentProps<RouteParams>;

/**
 * Responsibilities:
 *  1). get plan from api
 *  2). render drillDown table where, user can select assignments
 */
export const JurisdictionAssignmentView = (props: JurisdictionAssignmentViewFullProps) => {
  const {
    plan,
    serviceClass,
    fetchPlanCreator,
    tree,
    treeFetchedCreator,
    autoSelectNodesCreator,
  } = props;

  const initialLoadingState = !tree || !plan;
  const { startLoading, stopLoading, loading } = useLoadingReducer(initialLoadingState);
  const { errorMessage, handleBrokenPage, broken } = useHandleBrokenPage();
  const { rootId } = props.match.params;

  usePlanEffect(
    props.match.params.planId,
    plan,
    serviceClass,
    fetchPlanCreator,
    handleBrokenPage,
    stopLoading,
    startLoading
  );

  /** helper to create the callback function that will be called on each node in the tree
   * @param thePlan - plan to derive the existing assignments from.
   */
  const autoSelectCallbackFactory = (thePlan: PlanDefinition) => (node: TreeNode) => {
    const existingAssignmentsIds = thePlan.jurisdiction.map(
      jurisdictionCode => jurisdictionCode.code
    );
    return existingAssignmentsIds.includes(node.model.id);
  };

  /** autoSelects existing plan jurisdiction assignments
   * @param thePlan - plan to derive the existing assignments from.
   */
  const getTreeCallback = (thePlan: PlanDefinition) => {
    const autoSelectCallback = autoSelectCallbackFactory(thePlan);
    autoSelectNodesCreator(
      rootId,
      autoSelectCallback,
      thePlan.identifier,
      SELECTION_REASON.USER_CHANGE
    );
  };

  useGetJurisdictionTree(
    rootId,
    startLoading,
    treeFetchedCreator,
    stopLoading,
    handleBrokenPage,
    tree
  );

  useEffect(() => {
    if (plan && tree) {
      getTreeCallback(plan);
    }
  }, [plan, tree]);

  if (loading()) {
    return <Ripple />;
  }

  if (!plan) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_PLAN} />;
  }

  if (!tree) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_JURISDICTION_HIERARCHY} />;
  }
  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  const JurisdictionTableProps = {
    autoSelectionFlow: false,
    currentParentId: props.match.params.parentId,
    plan,
    rootJurisdictionId: rootId,
    serviceClass,
  };

  const AssignmentWrapperProps = {
    baseAssignmentURL: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootId}`,
    currentParentId: props.match.params.parentId,
    jurisdictionsChunkSize: 30,
    plan,
    rootJurisdictionId: rootId,
    serviceClass,
  };

  const breadcrumbProps = {
    currentPage: {
      label: plan.title,
      url: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
    },
    pages: [
      {
        label: PLANNING_PAGE_TITLE,
        url: PLANNING_VIEW_URL,
      },
    ],
  };

  const pageTitle = ASSIGN_JURISDICTIONS;
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      {ASSIGNMENT_PAGE_SHOW_MAP && <ConnectedAssignmentMapWrapper {...AssignmentWrapperProps} />}
      <ConnectedJurisdictionTable {...JurisdictionTableProps} />
    </>
  );
};

JurisdictionAssignmentView.defaultProps = defaultProps;

type MapStateToProps = Pick<JurisdictionAssignmentViewProps, 'plan' | 'tree'>;
type DispatchToProps = Pick<
  JurisdictionAssignmentViewProps,
  'fetchPlanCreator' | 'treeFetchedCreator' | 'autoSelectNodesCreator'
>;

const treeByIdSelector = getTreeById();

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionAssignmentViewFullProps
): MapStateToProps => {
  const planId = ownProps.match.params.planId;
  const planObj = getPlanDefinitionById(state, planId);
  return {
    plan: planObj,
    tree: treeByIdSelector(state, { rootJurisdictionId: ownProps.match.params.rootId }),
  };
};

const mapDispatchToProps: DispatchToProps = {
  autoSelectNodesCreator: autoSelectNodes,
  fetchPlanCreator: addPlanDefinition,
  treeFetchedCreator: fetchTree,
};

const ConnectedJurisdictionAssignmentView = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionAssignmentView);

export default ConnectedJurisdictionAssignmentView;
