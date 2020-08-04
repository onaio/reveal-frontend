import reducerRegistry from '@onaio/redux-reducer-registry';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ActionCreator, Store } from 'redux';
import Loading from '../../../components/page/Loading';
import { withTreeWalker } from '../../../components/TreeWalker';
import { ASSIGNMENT_PAGE_SHOW_MAP, MAP_DISABLED_PLAN_TYPES } from '../../../configs/env';
import {
  AN_ERROR_OCURRED,
  COULD_NOT_LOAD_ASSIGNMENTS,
  COULD_NOT_LOAD_CHILDREN,
  COULD_NOT_LOAD_PARENTS,
  COULD_NOT_LOAD_PLAN,
  COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY,
  COULD_NOT_LOAD_TEAMS,
  THE_SPECIFIC_ERROR_IS,
} from '../../../configs/lang';
import { PlanDefinition } from '../../../configs/settings';
import {
  INTERVENTION_TYPE_CODE,
  OPENSRP_GET_ASSIGNMENTS_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PLAN_HIERARCHY_ENDPOINT,
  OPENSRP_PLANS,
} from '../../../constants';
import { displayError } from '../../../helpers/errors';
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
import { JurisdictionTable, JurisdictionTableProps } from './helpers/JurisdictionTable';
import { AssignmentResponse } from './helpers/types';

// register reducers
reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

// TODO: Determine if this can safely be un-commented so as not to remount
// const WrappedJurisdictionTable = withTreeWalker<JurisdictionTableProps>(JurisdictionTable);

/** PlanAssignment props */
interface PlanAssignmentProps extends JurisdictionTableProps {
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

  /** We should not proceed without a plan id */
  if (!planId) {
    return null;
  }

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
    const OpenSRPAssignedService = new OpenSRPServiceClass(OPENSRP_GET_ASSIGNMENTS_ENDPOINT);
    const assignmentsPromise = OpenSRPAssignedService.list({ plan: planId })
      .then((response: AssignmentResponse[]) => {
        if (response) {
          const receivedAssignments: Assignment[] = response.map(assignment => {
            return {
              fromDate: moment(assignment.fromDate).format(),
              jurisdiction: assignment.jurisdictionId,
              organization: assignment.organizationId,
              plan: assignment.planId,
              toDate: moment(assignment.toDate).format(),
            };
          });
          // save assignments to store
          fetchAssignmentsActionCreator(receivedAssignments);
        } else {
          displayError(Error(COULD_NOT_LOAD_ASSIGNMENTS));
        }
      })
      .catch(e => displayError(e));

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
  const WrappedJurisdictionTable = withTreeWalker<JurisdictionTableProps>(JurisdictionTable);

  /** Props to be passed to the wrapped component */
  const wrappedProps = {
    ...props,
    LoadingIndicator: Loading, // TODO: indicate what is loading
    assignments,
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
    currentParentId: jurisdictionId,
    rootJurisdictionId: props.match.params.planId,
    serviceClass: OpenSRPServiceClass,
  };

  return (
    <>
      {!isMapDisabled(plan) && <ConnectedAssignmentMapWrapper {...AssignmentWraperProps} />}
      <WrappedJurisdictionTable {...wrappedProps} />
    </>
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

  const tree = treeSelector(state, { rootJurisdictionId: ownProps.match.params.planId });

  return {
    assignments,
    organizations,
    plan,
    tree: tree || null,
  };
};

/** Connected PlanAssignment component */
export const ConnectedPlanAssignment = connect(mapStateToProps, mapDispatchToProps)(PlanAssignment);
