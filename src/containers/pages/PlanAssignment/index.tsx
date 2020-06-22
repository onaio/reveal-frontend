import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import Loading from '../../../components/page/Loading';
import { withTreeWalker } from '../../../components/TreeWalker';
import { SimpleJurisdiction } from '../../../components/TreeWalker/types';
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

interface PlanAssignmentProps extends JurisdictionTableProps {
  addPlanActionCreator: typeof addPlanDefinition;
  fetchAssignmentsActionCreator: typeof fetchAssignments;
  fetchOrganizationsActionCreator: typeof fetchOrganizations;
}

const PlanAssignment = (props: PlanAssignmentProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hierarchyLimits, setHierarchyLimits] = useState<SimpleJurisdiction[]>([]);

  const {
    addPlanActionCreator,
    assignments,
    fetchAssignmentsActionCreator,
    fetchOrganizationsActionCreator,
    organizations,
    plan,
  } = props;
  const planId = props.match.params.planId;

  if (!planId) {
    return null;
  }

  /** define superset filter params for jurisdictions */
  const supersetParams = superset.getFormData(15000, [
    { comparator: planId, operator: '==', subject: 'plan_id' },
  ]);

  useEffect(() => {
    supersetFetch('577', supersetParams)
      .then((result: SimpleJurisdiction[]) => {
        if (result) {
          setHierarchyLimits(result);
        }
      })
      .finally(() => setLoading(false))
      .catch(e => displayError(e));

    // get all assignments
    const OpenSrpAssignedService = new OpenSRPService(OPENSRP_GET_ASSIGNMENTS_ENDPOINT);
    OpenSrpAssignedService.list({ plan: planId })
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
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));

    // fetch all organizations
    const OpenSRPOrganizationService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
    OpenSRPOrganizationService.list()
      .then((response: Organization[]) => {
        if (response) {
          // save all organizations to store
          fetchOrganizationsActionCreator(response);
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));

    // fetch current plan
    const OpenSRPPlanService = new OpenSRPService(OPENSRP_PLANS);
    OpenSRPPlanService.read(planId)
      .then((response: PlanDefinition[]) => {
        if (response && response.length > 0) {
          // save plan to store
          addPlanActionCreator(response[0]);
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));
  }, []);

  if (loading) {
    // TODO: show message of what is actually loading
    // return <Fragment>plan hierarchy loading...</Fragment>;
    return <Loading />;
  }

  let jurisdictionId = props.match.params.jurisdictionId;
  if (!jurisdictionId) {
    jurisdictionId = '';
  }

  // TODO: Determine if this can safely be moved outside this component so as not to remount
  const WrappedJurisdictionTable = withTreeWalker<JurisdictionTableProps>(JurisdictionTable);

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
