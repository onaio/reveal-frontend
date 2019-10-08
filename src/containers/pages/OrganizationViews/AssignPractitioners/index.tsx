/** view to assign practitioners to an organization */
import { Field, Formik } from 'formik';

{
  /* <FormGroup>
<Field
  component={AssignPractitioner}
  name="practitioners"
  id="practitioners"
  placeholder="Add Practitioners"
  aria-label="Add Practitioners"
  disabled={disabledFields.includes('practitioners')}
  className={errors.practitioners ? 'is-invalid async-select' : 'async-select'}
  allPractitionersApi={OPENSRP_PRACTITIONER_ENDPOINT}
  practitionersByOrgApi={''}
  serviceClass={OpenSRPService}
  // tslint:disable-next-line: jsx-no-lambda
  onAdd={(practitionersIds: string[]) =>
    setFieldValue('practitioners', practitionersIds)
  }
/>
</FormGroup> */
}

/** Wraps react select multi async to provide a form input that
 * pulls and selects at least one practitioner
 */
import { RouteParams } from '@onaio/gatekeeper/dist/types';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import React, { Props, useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import AsyncSelect from 'react-select/async';
import { ActionTypes, OptionsType, ValueType } from 'react-select/src/types';
import { Button } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  ADD,
  ASSIGN,
  ASSIGN_PRACTITIONERS_URL,
  CREATE_ORGANIZATION_URL,
  EDIT_ORGANIZATION_URL,
  EDIT_TEAM,
  HOME,
  HOME_URL,
  NEW_TEAM,
  OPENSRP_ORG_PRACTITIONER_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PRACTITIONER_ENDPOINT,
  OPENSRP_PRACTITIONER_ROLE_ENDPOINT,
  ORGANIZATIONS_LABEL,
  ORGANIZATIONS_LIST_URL,
  PRACTITIONERS,
  TO,
} from '../../../../constants';
import { generateNameSpacedUUID } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
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
import { styles } from './utils';

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

/** interface of an option in the component's state */
interface SelectedOption {
  readonly label: string;
  readonly value: string;
  readonly isFixed: boolean;
}

/** AssignPractitioner component */
const AssignPractitioner: React.FC<PropsTypes> = props => {
  const {
    serviceClass,
    fetchOrganizationsCreator,
    organization,
    fetchPractitionerRolesCreator,
    assignedPractitioners,
  } = props;
  const [selectedOptions, setSelectedOptions] = useState<OptionsType<SelectedOption>>([]);
  const [assignedOptions, setAssignedOptions] = useState<Practitioner[]>([]);

  /** load practitioners that belong to this organization */
  const loadOrgPractitioners = async (organizationId: string) => {
    // console.log("called loadOrgPractitioners")
    const serve = new serviceClass(OPENSRP_ORG_PRACTITIONER_ENDPOINT);
    const orgPractitioners = await serve.read(organizationId);
    store.dispatch(fetchPractitionerRolesCreator(orgPractitioners, organizationId));
  };

  /** load all practitioners at least all of those returned
   * in a single call to Practitioners endpoint
   */
  // const loadAllPractitioners = async () => {
  //   const serve = new serviceClass(OPENSRP_PRACTITIONER_ENDPOINT);
  //   const allPractitioners = await serve.list();
  //   return formatOptions(allPractitioners);
  // };

  // TODO - this is wet code
  const loadOrganization = async (organizationId: string) => {
    const serve = new serviceClass(OPENSRP_ORGANIZATION_ENDPOINT);

    serve
      .read(organizationId)
      .then((response: Organization) => store.dispatch(fetchOrganizationsCreator([response])));
  };

  useEffect(() => {
    const organizationId = props.match.params.id;
    loadOrganization(organizationId);
    loadOrgPractitioners(organizationId);
  }, []);

  if (!organization) {
    return <Loading />;
  }

  // /** formats Practitioner json object structure into a selectedOption object structure
  //  * @param {Practitioner []} practitioners - list of practitioner json objects
  //  * @param {boolean} isFixed - value of isFixed; option will be fixed if its already assigned
  //  * to organization
  //  * @return {OptionsType<SelectedOption>}
  //  */
  // const formatOptions = (
  //   practitioners: Practitioner[],
  //   isFixed: boolean = false
  // ): OptionsType<SelectedOption> =>
  //   practitioners.map(entry => ({
  //     isFixed,
  //     label: entry.username,
  //     value: entry.identifier,
  //   }));

  // // TODO - Hack in this: typings for the changeHandler function.
  // /** This sets the state selectedOptions
  //  * @param {ValueType<SelectedOption>} -  the so far selected options
  //  * @param {ActionMeta} - information on the change event; custom react-select event
  //  */
  // const changeHandler = (chosenOptions: any[], { action, removedValue }: any) => {
  //   if (!chosenOptions) {
  //     return;
  //   }
  //   switch (action) {
  //     case 'remove-value':
  //     case 'pop-value':
  //       if (removedValue.isFixed) {
  //         return;
  //       }
  //       break;
  //     case 'clear':
  //       chosenOptions = chosenOptions.filter(v => !v.isFixed);
  //   }
  //   setSelectedOptions(chosenOptions);
  // };

  // /** merges the practitioner records and returns them as  a promise */
  // const promiseOptions = async () => {
  //   // we need this to merge the practitioner records : those that belong to an
  //   // organization and those that are just fetched
  //   const orgPractitioners = formatOptions(assignedPractitioners, true);
  //   const allPractitioners = await loadAllPractitioners();
  //   const mergedOptions = {
  //     ...keyBy(orgPractitioners, option => option.value),
  //     ...keyBy(allPractitioners, option => option.value),
  //   };
  //   return values(mergedOptions);
  // };

  // const addHandler = () => {
  //   const code = {
  //     text: 'Community Health Worker',
  //   };
  //   // selected options
  //   const stringValues = selectedOptions.map(option => option.value);
  //   const jsonArrayPayload = stringValues.map(practitionerId => ({
  //     active: true,
  //     code,
  //     identifier: generateNameSpacedUUID('', ''),
  //     organization: organization.identifier,
  //     practitioner: practitionerId,
  //   }));
  //   const serve = new serviceClass(OPENSRP_PRACTITIONER_ROLE_ENDPOINT);
  //   serve.create(jsonArrayPayload);
  // };

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

  return (
    <div>
      <Helmet>
        <title>
          {ASSIGN} {PRACTITIONERS}
        </title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h2 className="mb-3 mt-5 page-title">{`${ASSIGN} ${PRACTITIONERS} ${TO} ${
        organization!.name
      }`}</h2>
      {/* section for displaying already Added practitioners to this organization */}
      {console.log(assignedPractitioners)};
      {assignedPractitioners.map((option, index) => (
        <section key={index}>
          <span className="assigned-options">{option.name}</span>
          <input
            type="hidden"
            readOnly={true}
            name={option.name}
            id={option.identifier}
            value={option.identifier}
          />
        </section>
      ))}
      <hr />
      {/* <AsyncSelect
        styles={styles}
        isClearable={selectedOptions.some(option => !option.isFixed)}
        isMulti={true}
        cacheOptions={true}
        defaultOptions={true}
        loadOptions={promiseOptions}
        onChange={changeHandler}
      />
      <Button onClick={addHandler}>{`${ADD} ${PRACTITIONERS}`}</Button> */}
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
  console.log(assignedPractitioners);
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
