import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Store } from 'redux';
import { OPENSRP_ORGANIZATION_ENDPOINT } from '../../../constants';
import { OpenSRPService } from '../../../services/opensrp';
import store from '../../../store';
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
  serviceClass: typeof OpenSRPService /** the OpenSRP service */;
  value: SelectOption[];
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
  serviceClass: OpenSRPService,
  value: [],
};

/**
 * OrganizationSelect - a flat select for Organizations
 * Allows you to Select Organizations to be assigned to the plan-jurisdiction
 * On selection update the `handleChange` method updates the Assignments store
 */
const OrganizationSelect = (props: OrganizationSelectProps) => {
  const {
    assignments,
    fetchAssignmentsAction,
    fetchOrganizationsAction,
    jurisdictionId,
    name,
    organizations,
    planId,
    serviceClass,
    value: selectOptions,
  } = props;

  const loadOrganizations = async (service: typeof serviceClass) => {
    const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT);
    serve
      .list()
      .then((response: Organization[]) => store.dispatch(fetchOrganizationsAction(response)))
      .catch((err: Error) => {
        /** TODO - find something to do with error */
      });
  };

  useEffect(() => {
    loadOrganizations(serviceClass);
  }, []);

  /** Get select options from OpenSRP as a promise */

  /**
   * onChange callback
   */
  const handleChange = (nextValues: any) => {
    const filteredAssignments: Assignment[] = assignments.filter(
      (a: Assignment) => a.jurisdiction !== jurisdictionId
    );
    const newAssignments: Assignment[] = nextValues.map(
      (v: SelectOption) =>
        ({
          jurisdiction: jurisdictionId,
          organization: v.value,
          plan: planId,
        } as Assignment)
    );
    const nextAssignments: Assignment[] = [...filteredAssignments, ...newAssignments];
    fetchAssignmentsAction(nextAssignments);
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
      placeholder={'Select'}
      aria-label={'Select'}
      onChange={handleChange}
      defaultOptions={true}
      options={options}
      isClearable={true}
      isMulti={true}
      value={selectOptions}
    />
  );
};

OrganizationSelect.defaultProps = defaultProps;

export { OrganizationSelect };

// connect to store
const mapStateToProps = (state: Partial<Store>, ownProps: OrganizationSelectProps) => {
  const organizations = keyBy(getOrganizationsArray(state), (o: Organization) => o.identifier);
  const assignments = getAssignmentsArrayByPlanId(state, ownProps.planId);
  const selectOptions = assignments
    .filter((a: Assignment) => a.jurisdiction === ownProps.jurisdictionId)
    .map(
      (a: Assignment) =>
        ({
          label:
            (organizations[a.organization] && organizations[a.organization].name) || a.organization,
          value: a.organization,
        } as SelectOption)
    );
  return {
    ...ownProps,
    assignments,
    organizations: values(organizations),
    value: selectOptions,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchAssignmentsAction: fetchAssignments,
};

const ConnectedOrganizationSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationSelect);

export default ConnectedOrganizationSelect;
