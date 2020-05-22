import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Store } from 'redux';
import { SELECT } from '../../../configs/lang';
import { loadOrganizations } from '../../../containers/pages/OrganizationViews/helpers/serviceHooks';
import { displayError } from '../../../helpers/errors';
import { reactSelectNoOptionsText } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import assignmentReducer, {
  Assignment,
  fetchAssignments,
  getAssignmentsArrayByPlanId,
  reducerName as assignmentReducerName,
  resetPlanAssignments,
} from '../../../store/ducks/opensrp/assignments';
import organizationsReducer, {
  fetchOrganizations,
  getOrganizationsArray,
  getOrganizationsById,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../store/ducks/opensrp/organizations';

reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** react-select Option */
interface SelectOption {
  label: string;
  value: string;
}

/** OrganizationSelect props */
export interface OrganizationSelectProps {
  assignments: Assignment[];
  fetchAssignmentsAction: typeof fetchAssignments;
  fetchOrganizationsAction: typeof fetchOrganizations;
  jurisdictionId: string;
  name: string; // name of the input
  organizations: Organization[];
  planId: string;
  resetPlanAssignmentsAction: typeof resetPlanAssignments;
  serviceClass: typeof OpenSRPService /** the OpenSRP service */;
  value: SelectOption[];
  parentIds?: string[];
  parentAssignments?: string[];
}

/** default props for OrganizationSelect */
const defaultProps: OrganizationSelectProps = {
  assignments: [],
  fetchAssignmentsAction: fetchAssignments,
  fetchOrganizationsAction: fetchOrganizations,
  jurisdictionId: '',
  name: '',
  organizations: [],
  planId: '',
  resetPlanAssignmentsAction: resetPlanAssignments,
  serviceClass: OpenSRPService,
  value: [],
};

/**
 * OrganizationSelect - a flat select for Organizations
 * Allows you to Select Organizations to be assigned to the plan-jurisdiction
 * On selection update the `handleChange` method updates the Assignments store
 */
export const OrganizationSelect = (props: OrganizationSelectProps) => {
  const {
    assignments,
    fetchAssignmentsAction,
    fetchOrganizationsAction,
    jurisdictionId,
    name,
    organizations,
    parentAssignments,
    planId,
    resetPlanAssignmentsAction,
    serviceClass,
    value: selectOptions,
  } = props;

  useEffect(() => {
    loadOrganizations(serviceClass, fetchOrganizationsAction).catch(err => displayError(err));
  }, []);

  /** Get select options from OpenSRP as a promise */

  /**handleChange
   * onChange callback
   * @param {any} nextValues - state of values after a change event on select
   */
  const handleChange = (nextValues: any) => {
    /** get assignments not assigned to this jurisdiction */
    const filteredAssignments: Assignment[] = assignments.filter(
      (a: Assignment) => a.jurisdiction !== jurisdictionId
    );
    const assignmentsToRemove = parentAssignments || [];
    /** nextValues is an empty array or has same size as parrents assignment array
     *  -> means change-event was a remove-options-event
     */
    if (!nextValues || (nextValues && nextValues.length === assignmentsToRemove.length)) {
      resetPlanAssignmentsAction({ [planId]: filteredAssignments });
    } else {
      const newAssignments: Assignment[] = nextValues
        .filter((assignment: SelectOption) => !assignmentsToRemove.includes(assignment.value))
        .map(
          (assignment: SelectOption) =>
            ({
              jurisdiction: jurisdictionId,
              organization: assignment.value,
              plan: planId,
            } as Assignment)
        );
      const nextAssignments: Assignment[] = [...filteredAssignments, ...newAssignments];
      fetchAssignmentsAction(nextAssignments);
    }
  };
  const options = organizations.map(
    o =>
      ({
        label: o.name,
        value: o.identifier,
      } as SelectOption)
  );

  return (
    <Select
      name={name}
      bsSize="lg"
      placeholder={SELECT}
      className="organization-select"
      classNamePrefix="reveal"
      aria-label={SELECT}
      onChange={handleChange}
      defaultOptions={true}
      options={options}
      isClearable={true}
      isMulti={true}
      value={selectOptions}
      noOptionsMessage={reactSelectNoOptionsText}
    />
  );
};

OrganizationSelect.defaultProps = defaultProps;

// connect to store
const mapStateToProps = (state: Partial<Store>, ownProps: OrganizationSelectProps) => {
  const organizationsById = getOrganizationsById(state);
  const assignments = getAssignmentsArrayByPlanId(state, ownProps.planId);
  const organizations = getOrganizationsArray(state);
  const idsToCheckAssignments =
    ownProps.parentIds && ownProps.parentIds.length
      ? [ownProps.jurisdictionId, ...ownProps.parentIds]
      : [ownProps.jurisdictionId];
  const uniqueOptionsIds: string[] = [];
  const selectOptions: SelectOption[] = [];
  assignments.forEach((a: Assignment) => {
    if (
      idsToCheckAssignments.includes(a.jurisdiction) &&
      !uniqueOptionsIds.includes(a.organization)
    ) {
      uniqueOptionsIds.push(a.organization);
      selectOptions.push({
        label:
          (organizationsById[a.organization] && organizationsById[a.organization].name) ||
          a.organization,
        value: a.organization,
      } as SelectOption);
    }
  });

  return {
    ...ownProps,
    assignments,
    organizations,
    value: selectOptions,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchAssignmentsAction: fetchAssignments,
  resetPlanAssignmentsAction: resetPlanAssignments,
};

const ConnectedOrganizationSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationSelect);

export default ConnectedOrganizationSelect;
