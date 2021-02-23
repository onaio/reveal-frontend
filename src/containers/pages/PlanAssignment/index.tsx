import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ActionCreator, Store } from 'redux';
import Loading from '../../../components/page/Loading';
import { withTreeWalker } from '../../../components/TreeWalker';
import {
  ASSIGNED_TEAMS_REQUEST_PAGE_SIZE,
  ASSIGNMENT_PAGE_SHOW_MAP,
  MAP_DISABLED_PLAN_TYPES,
} from '../../../configs/env';
import {
  AN_ERROR_OCURRED,
  COULD_NOT_LOAD_CHILDREN,
  COULD_NOT_LOAD_PARENTS,
  COULD_NOT_LOAD_PLAN,
  COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY,
  COULD_NOT_LOAD_TEAMS,
  THE_SPECIFIC_ERROR_IS,
} from '../../../configs/lang';
import { PlanDefinition } from '../../../configs/settings';
import {
  ASSIGN_PLAN_URL,
  INTERVENTION_TYPE_CODE,
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PLAN_HIERARCHY_ENDPOINT,
  OPENSRP_PLANS,
} from '../../../constants';
import { OpenSRPService } from '../../../services/opensrp';
import assignmentReducer, {
  Assignment,
  fetchAssignments,
  getAssignmentsArrayByPlanId,
  reducerName as assignmentReducerName,
} from '../../../store/ducks/opensrp/assignments';
import hierarchyReducer, {
  FetchedTreeAction,
  fetchTree,
  getTreeById,
  reducerName as hierarchyReducerName,
} from '../../../store/ducks/opensrp/hierarchies';
import { RawOpenSRPHierarchy, TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
import organizationsReducer, {
  fetchOrganizations,
  getOrganizationsArray,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../store/ducks/opensrp/organizations';
import planDefinitionReducer, {
  addPlanDefinition,
  getPlanDefinitionById,
  reducerName as planDefinitionReducerName,
} from '../../../store/ducks/opensrp/PlanDefinition';
import { ConnectedAssignmentMapWrapper } from '../AssigmentMapWrapper';
import { useHandleBrokenPage } from '../JurisdictionAssignment/helpers/utils';
import { getAllAssignments } from './helpers/hooks/serviceHooks';
import {
  JurisdictionTableListView,
  JurisdictionTableListViewPropTypes,
} from './helpers/JurisdictionTableListView';
import { JurisdictionTableView, JurisdictionTableViewProps } from './helpers/JurisdictionTableView';

// register reducers
reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

// TODO: Determine if this can safely be un-commented so as not to remount
// const WrappedJurisdictionTable = withTreeWalker<JurisdictionTableProps>(JurisdictionTable);

/** PlanAssignment props */
interface PlanAssignmentProps extends JurisdictionTableListViewPropTypes {
  OpenSRPServiceClass: typeof OpenSRPService;
  addPlanActionCreator: typeof addPlanDefinition;
  fetchAssignmentsActionCreator: typeof fetchAssignments;
  fetchOrganizationsActionCreator: typeof fetchOrganizations;
  fetchTreeActionCreator: ActionCreator<FetchedTreeAction>;
  tree: TreeNode | null;
}
/**
 * Check if map should be visible based on plan type
 */
export const isMapDisabled = (plan: PlanDefinition | null): boolean => {
  if (!ASSIGNMENT_PAGE_SHOW_MAP) {
    return true;
  }
  if (plan) {
    const type = plan.useContext.find(element => element.code === INTERVENTION_TYPE_CODE);
    if (type) {
      return MAP_DISABLED_PLAN_TYPES.includes(type.valueCodableConcept);
    }
  }
  return false;
};

/**
 * PlanAssignment
 *
 * This component handles the plan assignment pages i.e. the pages where a user is
 * able to assign organizations to the plan's jurisdictions.
 *
 * @param props - the expected props
 */
const PlanAssignment = (props: PlanAssignmentProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hideBottomBreadCrumb, setHideBottomBreadCrumb] = useState<boolean>(false);
  const {
    OpenSRPServiceClass,
    addPlanActionCreator,
    assignments,
    fetchAssignmentsActionCreator,
    fetchOrganizationsActionCreator,
    fetchTreeActionCreator,
    tree,
    organizations,
    plan,
  } = props;
  const planId = props.match.params.planId;

  /** Convenience function to handle cases where we must abort and tell the user we have done so */
  const { handleBrokenPage, broken, errorMessage } = useHandleBrokenPage();

  useEffect(() => {
    // Get Plan hierarchy
    const OpenPlanHierarchyService = new OpenSRPServiceClass(OPENSRP_PLAN_HIERARCHY_ENDPOINT);
    const planHierarchyPromise = OpenPlanHierarchyService.read(planId, {
      return_structure_count: false,
    })
      .then((response: RawOpenSRPHierarchy) => {
        if (response) {
          fetchTreeActionCreator(response, planId);
        } else {
          throw new Error(COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY);
        }
      })
      .catch(e => {
        handleBrokenPage(e.message);
      });

    // get all assignments
    const assignmentsPromise = getAllAssignments(
      OpenSRPServiceClass,
      planId,
      fetchAssignmentsActionCreator,
      { getAll: true, pageSize: ASSIGNED_TEAMS_REQUEST_PAGE_SIZE }
    );

    // fetch all organizations
    const OpenSRPOrganizationService = new OpenSRPServiceClass(OPENSRP_ORGANIZATION_ENDPOINT);
    const organizationsPromise = OpenSRPOrganizationService.list()
      .then((response: Organization[]) => {
        if (response) {
          // save all organizations to store
          fetchOrganizationsActionCreator(response);
        } else {
          if (organizations.length < 1) {
            // this means that we basically have not succeeded to make this call
            // if organizations is not populated we cannot proceed
            handleBrokenPage(COULD_NOT_LOAD_TEAMS);
          }
        }
      })
      .catch(e => {
        handleBrokenPage(e.message);
      });

    // fetch current plan
    const OpenSRPPlanService = new OpenSRPServiceClass(OPENSRP_PLANS);
    const plansPromise = OpenSRPPlanService.read(planId)
      .then((response: PlanDefinition[]) => {
        if (response && response.length > 0) {
          // save plan to store
          addPlanActionCreator(response[0]);
        } else {
          if (!plan) {
            // this means that we basically have not succeeded to make this call
            // if no plan then we cannot proceed
            handleBrokenPage(COULD_NOT_LOAD_PLAN);
          }
        }
      })
      .catch(e => {
        handleBrokenPage(e.message);
      });

    Promise.all([planHierarchyPromise, assignmentsPromise, organizationsPromise, plansPromise])
      .finally(() => setLoading(false))
      .catch(e => {
        handleBrokenPage(e.message);
      });
  }, []);

  /** We should not proceed without a plan id */
  if (!planId) {
    return null;
  }

  if (loading) {
    // TODO: show message of what is actually loading
    return <Loading />;
  }

  if (!tree) {
    // we absolutely MUST stop if we do not have a tree
    if (!broken) {
      handleBrokenPage(COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY);
    }
  }

  if (broken) {
    return (
      <div className="global-error-container">
        <p>{AN_ERROR_OCURRED}</p>
        {errorMessage && (
          <p>
            {THE_SPECIFIC_ERROR_IS}: <span className="text-danger">{errorMessage}</span>
          </p>
        )}
      </div>
    );
  }

  let jurisdictionId = props.match.params.jurisdictionId;
  if (!jurisdictionId) {
    jurisdictionId = '';
  }

  // TODO: Determine if this can safely be moved outside this component so as not to remount
  const WrappedJurisdictionTableView = withTreeWalker<JurisdictionTableViewProps>(
    JurisdictionTableView
  );
  const WrappedJurisdictionTableListView = withTreeWalker<JurisdictionTableListViewPropTypes>(
    JurisdictionTableListView
  );

  /** Props to be passed to the wrapped components */
  const wrappedProps = {
    ...props,
    LoadingIndicator: Loading, // TODO: indicate what is loading
    assignments,
    hideBottomBreadCrumb,
    jurisdictionId,
    labels: {
      loadAncestorsError: COULD_NOT_LOAD_PARENTS,
      loadChildrenError: COULD_NOT_LOAD_CHILDREN,
    },
    organizations,
    plan,
    submitCallBackFunc: fetchAssignmentsActionCreator,
    tree,
    useJurisdictionNodeType: false,
  };

  const AssignmentWraperProps = {
    baseAssignmentURL: `${ASSIGN_PLAN_URL}/${(plan as PlanDefinition).identifier}`,
    currentParentId: jurisdictionId,
    hideBottomBreadCrumbCallback: setHideBottomBreadCrumb,
    isPlanAssignmentPage: true,
    jurisdictionsChunkSize: 30,
    matchFeatures: true,
    plan: plan as PlanDefinition,
    rootJurisdictionId: props.match.params.planId,
    serviceClass: OpenSRPServiceClass,
  };

  return (
    <Fragment>
      <WrappedJurisdictionTableView {...wrappedProps} />
      {!isMapDisabled(plan) && <ConnectedAssignmentMapWrapper {...AssignmentWraperProps} />}
      <WrappedJurisdictionTableListView {...wrappedProps} />
    </Fragment>
  );
};

/** Default props for PlanAssignment */
const defaultPlanAssignmentProps: Partial<PlanAssignmentProps> = {
  OpenSRPServiceClass: OpenSRPService,
  addPlanActionCreator: addPlanDefinition,
  fetchAssignmentsActionCreator: fetchAssignments,
  fetchOrganizationsActionCreator: fetchOrganizations,
  fetchTreeActionCreator: fetchTree,
};

PlanAssignment.defaultProps = defaultPlanAssignmentProps;

export { PlanAssignment };

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  assignments: Assignment[];
  organizations: Organization[];
  plan: PlanDefinition | null;
  tree: TreeNode | null;
}

/** map dispatch to props */
const mapDispatchToProps = {
  addPlanActionCreator: addPlanDefinition,
  fetchAssignmentsActionCreator: fetchAssignments,
  fetchOrganizationsActionCreator: fetchOrganizations,
  fetchTreeActionCreator: fetchTree,
};

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  // selectors
  const treeSelector = getTreeById();

  // TODO: use reselect
  const plan = getPlanDefinitionById(state, ownProps.match.params.planId);
  const organizations = getOrganizationsArray(state);
  const assignments = getAssignmentsArrayByPlanId(state, ownProps.match.params.planId);

  const tree = treeSelector(state, {
    rootJurisdictionId: ownProps.match.params.planId,
  });

  return {
    assignments,
    organizations,
    plan,
    tree: tree || null,
  };
};

/** Connected PlanAssignment component */
export const ConnectedPlanAssignment = connect(mapStateToProps, mapDispatchToProps)(PlanAssignment);
