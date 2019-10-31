/** Wraps react select multi async to provide a view input that
 * pulls and selects at least one practitioner
 */
import { RouteParams } from '@onaio/gatekeeper/dist/types';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, throttle, values } from 'lodash';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import AsyncSelect from 'react-select/async';
import { OptionsType, ValueType } from 'react-select/src/types';
import { Button } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { PRACTITIONER_ROLE_NAMESPACE } from '../../../../configs/env';
import {
  ADD,
  ASSIGN,
  ASSIGN_PRACTITIONERS_URL,
  HOME,
  HOME_URL,
  NO_PRACTITIONERS_ADDED_YET,
  OPENSRP_ADD_PRACTITIONER_ROLE_ENDPOINT,
  OPENSRP_PRACTITIONER_ENDPOINT,
  ORGANIZATIONS_LABEL,
  ORGANIZATIONS_LIST_URL,
  PRACTITIONER_CODE,
  PRACTITIONERS,
  TO,
} from '../../../../constants';
import { generateNameSpacedUUID } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import organizationsReducer, {
  fetchOrganizations,
  getOrganizationById,
  Organization,
  reducerName as organizationReducerName,
} from '../../../../store/ducks/opensrp/organizations';
import practitionersReducer, {
  fetchPractitionerRoles,
  getPractitionersByOrgId,
  Practitioner,
  reducerName as practitionerReducerName,
} from '../../../../store/ducks/opensrp/practitioners';
import { loadOrganization, loadOrgPractitioners } from '../serviceHooks';
import { filterOptions, formatOptions, SelectOption, styles } from './utils';

reducerRegistry.register(organizationReducerName, organizationsReducer);
reducerRegistry.register(practitionerReducerName, practitionersReducer);

/** Props for AssignPractitioner component */
interface AssignPractitionerProps {
  fetchOrganizationsCreator: typeof fetchOrganizations;
  fetchPractitionerRolesCreator: typeof fetchPractitionerRoles;
  organization: Organization | null;
  serviceClass: typeof OpenSRPService;
  assignedPractitioners: Practitioner[];
}

/** default props for AssignPractitioner component */
const defaultAssignPractitionerProps: AssignPractitionerProps = {
  assignedPractitioners: [],
  fetchOrganizationsCreator: fetchOrganizations,
  fetchPractitionerRolesCreator: fetchPractitionerRoles,
  organization: null,
  serviceClass: OpenSRPService,
};

/** type intersection for all types that pertain to the props */
export type PropsTypes = AssignPractitionerProps & RouteComponentProps<RouteParams>;

/** AssignPractitioner component */
const AssignPractitioner = (props: PropsTypes) => {
  const {
    serviceClass,
    fetchOrganizationsCreator,
    organization,
    fetchPractitionerRolesCreator,
    assignedPractitioners,
  } = props;
  const [selectedOptions, setSelectedOptions] = useState<OptionsType<SelectOption>>([]);

  useEffect(() => {
    const organizationId = props.match.params.id;
    loadOrganization(organizationId, serviceClass, fetchOrganizationsCreator);
    loadOrgPractitioners(organizationId, serviceClass, fetchPractitionerRolesCreator);
  }, []);

  if (!organization) {
    return <Loading />;
  }

  /** load all practitioners at least all of those returned
   * in a single call to Practitioners endpoint
   * @param {typeof OpenSRPService} service - the OpenSRPService
   */
  const loadAllPractitioners = async (service: typeof OpenSRPService = OpenSRPService) => {
    const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT);
    const allPractitioners = await serve.list();
    return formatOptions(allPractitioners);
  };

  /** This sets the state selectedOptions
   * @param {ValueType<SelectOption>} chosenOptions -  the so far selected options
   * @param {ActionMeta} { action, removedValue, option } - on the change event; custom react-select event
   */
  const changeHandler = (
    chosenOptions: ValueType<SelectOption>,
    { action, removedValue, option }: any
  ) => {
    switch (action) {
      case 'remove-value':
      case 'pop-value':
        if (removedValue.isFixed) {
          return;
        } else {
          const remainingOptions = selectedOptions.filter(o => o.value !== removedValue.value);
          setSelectedOptions(remainingOptions);
        }
        break;
      case 'select-option':
        setSelectedOptions([...selectedOptions, option]);
        break;
      case 'clear':
        chosenOptions = (chosenOptions as SelectOption[]).filter((v: any) => !v.isFixed);
    }
  };

  /** merges the practitioner records to be shown in the dropdown and returns them as  a promise
   * @param {string} typedChars - value of select if user types in on it
   */
  const promiseOptions = async (typedChars: string) => {
    // merging practitioners that are assigned to the organization and all practitioners
    const orgPractitioners = formatOptions(assignedPractitioners, true);
    const allPractitioners = await loadAllPractitioners();
    const mergedOptions = {
      ...keyBy(orgPractitioners, option => option.value),
      ...keyBy(allPractitioners, option => option.value),
    };
    return filterOptions(typedChars, values(mergedOptions));
  };

  /** throttles the getting promiseOptions by 1 second */
  const throttledPromiseOptions = throttle(promiseOptions, 1000);

  /** handles clicking on the add button */
  const addHandler = () => {
    // selected options
    const practitionerIds = selectedOptions.map(option => option.value);
    const jsonArrayPayload = practitionerIds.map((practitionerId, index) => ({
      active: true,
      code: PRACTITIONER_CODE,
      identifier: generateNameSpacedUUID(`${Date.now()} ${index}`, PRACTITIONER_ROLE_NAMESPACE),
      organization: organization.identifier,
      practitioner: practitionerId,
    }));
    const serve = new serviceClass(OPENSRP_ADD_PRACTITIONER_ROLE_ENDPOINT);
    serve.create(jsonArrayPayload).then(() => {
      loadOrgPractitioners(organization.identifier, serviceClass, fetchPractitionerRolesCreator);
      try {
        setSelectedOptions([]);
      } catch (err) {
        /** expected error: setState on unmounted component */
      }
    });
  };

  // Props

  // breadcrumb props
  const basePage = {
    label: ORGANIZATIONS_LABEL,
    url: ORGANIZATIONS_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: 'Assign Practitioners',
      url: ASSIGN_PRACTITIONERS_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage, basePage];

  // derived values

  /** the options to be passed to react-select as having already been selected */
  const value = [...formatOptions(assignedPractitioners, true), ...selectedOptions];
  /** activate add button if there are selected options that can be posted to api */
  const activateAddButton = !!selectedOptions.length;

  return (
    <div>
      <Helmet>
        <title>{`${ASSIGN} ${PRACTITIONERS}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h2 className="mb-3 mt-5 page-title">{`${ASSIGN} ${PRACTITIONERS} ${TO} ${
        organization!.name
      }`}</h2>
      <hr />

      {/* section for displaying already Added practitioners to this organization */}
      {assignedPractitioners.length > 0 ? (
        assignedPractitioners.map((option, index) => (
          <section key={index}>
            <span className="assigned-options text-muted">
              {option.name}({option.username})
            </span>
            <input
              type="hidden"
              readOnly={true}
              name={option.name}
              id={option.identifier}
              value={option.identifier}
            />
          </section>
        ))
      ) : (
        <section>
          <p className="text-info"> {NO_PRACTITIONERS_ADDED_YET} </p>
        </section>
      )}
      <hr />
      <AsyncSelect
        className="w-75"
        styles={styles}
        isClearable={selectedOptions.some(option => !option.isFixed)}
        isMulti={true}
        cacheOptions={true}
        defaultOptions={true}
        loadOptions={throttledPromiseOptions}
        onChange={changeHandler}
        value={value}
      />
      <br />
      <Button
        className={`btn btn-primary ${activateAddButton ? '' : 'disabled'}`}
        onClick={addHandler}
      >{`${ADD} ${PRACTITIONERS}`}</Button>
    </div>
  );
};

AssignPractitioner.defaultProps = defaultAssignPractitionerProps;

export { AssignPractitioner };

/** Interface for connected state to props */
interface DispatchedProps {
  organization: Organization | null;
  assignedPractitioners: Practitioner[];
}

// connect to store
const mapStateToProps = (state: Partial<Store>, ownProps: PropsTypes): DispatchedProps => {
  let organizationId = ownProps.match.params.id;
  organizationId = organizationId ? organizationId : '';

  const organization = getOrganizationById(state, organizationId);
  const assignedPractitioners = getPractitionersByOrgId(state, organizationId);
  return { organization, assignedPractitioners };
};

/** map props to action creators */
const mapDispatchToProps = {
  fetchOrganizationsCreator: fetchOrganizations,
  fetchPractitionerRolesCreator: fetchPractitionerRoles,
};

const ConnectedAssignPractitioner = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignPractitioner);

export default ConnectedAssignPractitioner;
