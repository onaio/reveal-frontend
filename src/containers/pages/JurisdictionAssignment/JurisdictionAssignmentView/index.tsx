/** the Manual Jurisdiction Selection view
 * Responsibilities:
 *  load plan given a url with the planId
 *  pending : render map.
 *  render table from which a user can assign jurisdictions to the active plan
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import { Result } from '@onaio/utils';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ActionCreator, Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Ripple from '../../../../components/page/Loading';
import { JURISDICTION_METADATA_RISK } from '../../../../configs/env';
import {
  ASSIGN_JURISDICTIONS,
  COULD_NOT_LOAD_JURISDICTION,
  COULD_NOT_LOAD_JURISDICTION_HIERARCHY,
  COULD_NOT_LOAD_PLAN,
  PLANNING_PAGE_TITLE,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { ASSIGN_JURISDICTIONS_URL, PLANNING_VIEW_URL } from '../../../../constants';
import {
  loadJurisdictionsMetadata,
  LoadOpenSRPHierarchy,
} from '../../../../helpers/dataLoading/jurisdictions';
import { displayError } from '../../../../helpers/errors';
import { useLoadingReducer } from '../../../../helpers/useLoadingReducer';
import { OpenSRPService } from '../../../../services/opensrp';
import {
  autoSelectNodes,
  AutoSelectNodesAction,
  FetchedTreeAction,
  fetchTree,
  getTreeById,
} from '../../../../store/ducks/opensrp/hierarchies';
import { RawOpenSRPHierarchy, TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { selectionReason } from '../../../../store/ducks/opensrp/hierarchies/utils';
import jurisdictionMetadataReducer, {
  fetchJurisdictionsMetadata,
  FetchJurisdictionsMetadataAction,
  getJurisdictionsMetadata,
  JurisdictionsMetadata,
  reducerName as jurisdictionMetadataReducerName,
} from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import plansReducer, {
  addPlanDefinition,
  AddPlanDefinitionAction,
  getPlanDefinitionById,
  reducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { ConnectedAssignmentMapWrapper } from '../../AssigmentMapWrapper/';
import { useGetRootJurisdictionId, usePlanEffect } from '../EntryView/utils';
import { useHandleBrokenPage } from '../helpers/utils';
import { ConnectedJurisdictionTable } from '../JurisdictionTable';

reducerRegistry.register(reducerName, plansReducer);
reducerRegistry.register(jurisdictionMetadataReducerName, jurisdictionMetadataReducer);

/** this component's props */
export interface JurisdictionAssignmentViewProps {
  fetchJurisdictionsMetadataCreator: ActionCreator<FetchJurisdictionsMetadataAction>;
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
  jurisdictionsMetadata: JurisdictionsMetadata[];
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: ActionCreator<FetchedTreeAction>;
  autoSelectNodesCreator: ActionCreator<AutoSelectNodesAction>;
  tree: TreeNode | undefined;
}

export const defaultProps = {
  autoSelectNodesCreator: autoSelectNodes,
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchPlanCreator: addPlanDefinition,
  jurisdictionsMetadata: [],
  plan: null,
  serviceClass: OpenSRPService,
  tree: undefined,
  treeFetchedCreator: fetchTree,
};

/** view will require a planId from the url */
export interface RouteParams {
  planId: string;
  rootId?: string;
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
    fetchJurisdictionsMetadataCreator,
    jurisdictionsMetadata,
    tree,
  } = props;

  const initialLoadingState = !tree || !plan;
  const { startLoading, stopLoading, loading } = useLoadingReducer(initialLoadingState);
  const { errorMessage, handleBrokenPage, broken } = useHandleBrokenPage();

  React.useEffect(() => {
    const metadataLoadingKey = startLoading('metadata');
    loadJurisdictionsMetadata(
      JURISDICTION_METADATA_RISK,
      OpenSRPService,
      fetchJurisdictionsMetadataCreator
    )
      .then(() => {
        stopLoading(metadataLoadingKey);
      })
      .finally(() => {
        stopLoading(metadataLoadingKey);
      })
      .catch(error => {
        displayError(error);
      });
  }, []);

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
    startLoading,
    tree
  );

  React.useEffect(() => {
    if (!plan || !rootJurisdictionId) {
      return;
    }
    const callback = (node: TreeNode) => {
      const existingAssignments = plan.jurisdiction;
      return existingAssignments.includes(node.model.id);
    };
    const params = {
      return_structure_count: true,
    };
    if (rootJurisdictionId) {
      startLoading(rootJurisdictionId);
      LoadOpenSRPHierarchy(rootJurisdictionId, OpenSRPService, params)
        .then((apiResponse: Result<RawOpenSRPHierarchy>) => {
          if (apiResponse.value) {
            const responseData = apiResponse.value;
            props.treeFetchedCreator(responseData);
            props.autoSelectNodesCreator(rootJurisdictionId, callback, selectionReason.NOT_CHANGED);
            stopLoading(rootJurisdictionId);
          }
          if (apiResponse.error) {
            throw new Error(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
          }
        })
        .catch(() => {
          handleBrokenPage(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
          stopLoading(rootJurisdictionId);
        });
    }
  }, [rootJurisdictionId]);

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

  const JurisdictionTableProps = {
    autoSelectionFlow: false,
    currentParentId: props.match.params.parentId,
    jurisdictionsMetadata,
    plan,
    rootJurisdictionId,
    serviceClass,
  };

  const AssignmentWrapperProps = {
    currentParentId: props.match.params.parentId,
    rootJurisdictionId,
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
      <ConnectedAssignmentMapWrapper {...AssignmentWrapperProps} />
      <ConnectedJurisdictionTable {...JurisdictionTableProps} />
    </>
  );
};

JurisdictionAssignmentView.defaultProps = defaultProps;

type MapStateToProps = Pick<
  JurisdictionAssignmentViewProps,
  'plan' | 'jurisdictionsMetadata' | 'tree'
>;
type DispatchToProps = Pick<
  JurisdictionAssignmentViewProps,
  'fetchPlanCreator' | 'fetchJurisdictionsMetadataCreator'
>;

const treeByIdSelector = getTreeById();

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionAssignmentViewFullProps
): MapStateToProps => {
  const planId = ownProps.match.params.planId;
  const planObj = getPlanDefinitionById(state, planId);
  return {
    jurisdictionsMetadata: getJurisdictionsMetadata(state),
    plan: planObj,
    tree: treeByIdSelector(state, { rootJurisdictionId: ownProps.match.params.rootId || '' }),
  };
};

const mapDispatchToProps: DispatchToProps = {
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchPlanCreator: addPlanDefinition,
};

const ConnectedJurisdictionAssignmentView = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionAssignmentView);

export default ConnectedJurisdictionAssignmentView;
