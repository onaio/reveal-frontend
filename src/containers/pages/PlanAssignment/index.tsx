import superset from '@onaio/superset-connector';
import moment from 'moment';
import React, { Fragment, useEffect, useState } from 'react';
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
import { Assignment } from '../../../store/ducks/opensrp/assignments';
import { Organization } from '../../../store/ducks/opensrp/organizations';
import { JurisdictionTable, JurisdictionTableProps } from './helpers/JurisdictionTable';

const PlanAssignment = (props: JurisdictionTableProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hierarchyLimits, setHierarchyLimits] = useState<SimpleJurisdiction[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plan, setPlan] = useState<PlanDefinition | null>(null);

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
          setAssignments(receivedAssignments);
          // console.log('receivedAssignments >>> ', receivedAssignments);
          // store.dispatch(fetchAssignmentsActionCreator(assignments));
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));

    // fetch all organizations
    const OpenSRPOrganizationService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
    OpenSRPOrganizationService.list()
      .then((response: Organization[]) => {
        if (response) {
          setOrganizations(response);
          // console.log('Organizations >>> ', response);
          // save all organizations to store
          // store.dispatch(fetchOrganizationsActionCreator(response));
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));

    // fetch current plan
    const OpenSRPPlanService = new OpenSRPService(OPENSRP_PLANS);
    OpenSRPPlanService.read(planId)
      .then((response: PlanDefinition[]) => {
        if (response && response.length > 0) {
          setPlan(response[0]);
          // console.log('currentPlan >>> ', response[0]);
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));
  }, []);

  if (loading) {
    return <Fragment>plan hierarchy loading...</Fragment>;
  }

  let jurisdictionId = props.match.params.jurisdictionId;
  if (!jurisdictionId) {
    jurisdictionId = '';
  }

  const Wrapped = withTreeWalker<JurisdictionTableProps>(JurisdictionTable);

  const wrappedProps = {
    ...props,
    assignments,
    jurisdictionId,
    limits: hierarchyLimits,
    organizations,
    plan,
  };

  return <Wrapped {...wrappedProps} />;
};

export { PlanAssignment };
