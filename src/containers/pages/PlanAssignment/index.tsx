import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import Loading from '../../../components/page/Loading';
import { withTreeWalker } from '../../../components/TreeWalker';
import { SimpleJurisdiction } from '../../../components/TreeWalker/types';
import { SUPERSET_PLAN_HIERARCHY_SLICE } from '../../../configs/env';
import {
  AN_ERROR_OCURRED,
  COULD_NOT_LOAD_ASSIGNMENTS,
  COULD_NOT_LOAD_PLAN,
  COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY,
  COULD_NOT_LOAD_TEAMS,
  THE_SPECIFIC_ERROR_IS,
} from '../../../configs/lang';
import { PlanDefinition } from '../../../configs/settings';
import {
  OPENSRP_GET_ASSIGNMENTS_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PLANS,
} from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { OpenSRPService } from '../../../services/opensrp';
import supersetFetch from '../../../services/superset';
import assignmentReducer, {
  Assignment,
  fetchAssignments,
  getAssignmentsArrayByPlanId,
  reducerName as assignmentReducerName,
} from '../../../store/ducks/opensrp/assignments';
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
import { JurisdictionTable, JurisdictionTableProps } from './helpers/JurisdictionTable';

// register reducers
reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

// TODO: Determine if this can safely be un-commented so as not to remount
// const WrappedJurisdictionTable = withTreeWalker<JurisdictionTableProps>(JurisdictionTable);

/** PlanAssignment props */
interface PlanAssignmentProps extends JurisdictionTableProps {
  OpenSRPServiceClass: typeof OpenSRPService;
  addPlanActionCreator: typeof addPlanDefinition;
  fetchAssignmentsActionCreator: typeof fetchAssignments;
  fetchOrganizationsActionCreator: typeof fetchOrganizations;
  supersetService: typeof supersetFetch;
}

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
  const [broken, setBroken] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hierarchyLimits, setHierarchyLimits] = useState<SimpleJurisdiction[]>([]);

  const {
    OpenSRPServiceClass,
    addPlanActionCreator,
    assignments,
    fetchAssignmentsActionCreator,
    fetchOrganizationsActionCreator,
    organizations,
    plan,
    supersetService,
  } = props;
  const planId = props.match.params.planId;

  /** We should not proceed without a plan id */
  if (!planId) {
    return null;
  }

  /** Convenience function to handle cases where we must abort and tell the user we have done so */
  const handleBrokenPage = (message: string) => {
    displayError(Error(message));
    setErrorMessage(message);
    setBroken(true);
  };

  useEffect(() => {
    // Get Plan hierarchy
    const supersetParams = superset.getFormData(15000, [
      { comparator: planId, operator: '==', subject: 'plan_id' },
    ]);
    const planHierarchyPromise = supersetService(SUPERSET_PLAN_HIERARCHY_SLICE, supersetParams)
      .then((result: SimpleJurisdiction[]) => {
        if (result) {
          setHierarchyLimits(result);
        } else {
          if (hierarchyLimits.length < 1) {
            // this means that we basically have not succeeded to make this call
            // if hierarchyLimits is not populated we cannot proceed
            handleBrokenPage(COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY);
          }
        }
      })
      .catch(e => {
        handleBrokenPage(e.message);
      });

    // get all assignments
    const OpenSrpAssignedService = new OpenSRPServiceClass(OPENSRP_GET_ASSIGNMENTS_ENDPOINT);
    const assignmentsPromise = OpenSrpAssignedService.list({ plan: planId })
      .then((response: any[]) => {
        // TODO: remove any
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
    limits: hierarchyLimits,
    organizations,
    plan,
    submitCallBackFunc: fetchAssignmentsActionCreator,
  };

  return <WrappedJurisdictionTable {...wrappedProps} />;
};

/** Default props for PlanAssignment */
const defaultPlanAssignmentProps: Partial<PlanAssignmentProps> = {
  OpenSRPServiceClass: OpenSRPService,
  addPlanActionCreator: addPlanDefinition,
  fetchAssignmentsActionCreator: fetchAssignments,
  fetchOrganizationsActionCreator: fetchOrganizations,
  supersetService: supersetFetch,
};

PlanAssignment.defaultProps = defaultPlanAssignmentProps;

export { PlanAssignment };

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  assignments: Assignment[];
  organizations: Organization[];
  plan: PlanDefinition | null;
}

/** map dispatch to props */
const mapDispatchToProps = {
  addPlanActionCreator: addPlanDefinition,
  fetchAssignmentsActionCreator: fetchAssignments,
  fetchOrganizationsActionCreator: fetchOrganizations,
};

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  // TODO: use reselect
  const plan = getPlanDefinitionById(state, ownProps.match.params.planId);
  const organizations = getOrganizationsArray(state);
  const assignments = getAssignmentsArrayByPlanId(state, ownProps.match.params.planId);

  return {
    assignments,
    organizations,
    plan,
  };
};

/** Connected PlanAssignment component */
export const ConnectedPlanAssignment = connect(mapStateToProps, mapDispatchToProps)(PlanAssignment);
