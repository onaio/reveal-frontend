/** component to assign locations to an organization */
/** 2 inputs field:
 *  - select input to choose team from
 *  - Tree view to select locations from
 *  - some text to explain stuff
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useState } from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import AsyncSelect from 'react-select';
import { handleInputChange } from 'react-select/src/utils';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { PlanDefinition } from '../../../../configs/settings';
import {
  ASSIGN,
  ASSIGN_ORGANIZATION_URL,
  ASSIGNMENT,
  HOME,
  HOME_URL,
  OPENSRP_ORGANIZATION_ENDPOINT,
  ORGANIZATION_LABEL,
  ORGANIZATIONS_LABEL,
  PLAN_LIST_URL,
  PLANS,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import planDefinitionReducer, {
  fetchPlanDefinitions,
  getPlanDefinitionsById,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { Organization } from '../../../../store/ducks/organizations';

/** register the plan definitions reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

/** interface for PlanList props */
interface Props {
  fetchPlans: typeof fetchPlanDefinitions;
  plan: PlanDefinition;
  service: typeof OpenSRPService;
}

type PropsTypes = Props & RouteComponentProps;

interface SelectOptions {
  label: string;
  value: string;
}

const OrganizationAssignment: React.FC<PropsTypes> = props => {
  // what are we tracking in state for this component.
  // track state of the selected team. - only interested with the team id.

  const { plan } = props;
  // props //

  /** callback that helps update this component selected team state form inside the select component */
  // this will happen via prop
  const defaultSelectedOrg = { label: '', value: '' };

  const [organization, setOrganization] = useState<SelectOptions>(defaultSelectedOrg);
  // props for the header breadcrumb
  const basePage = {
    label: PLANS,
    url: PLAN_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: `${ASSIGN} ${ORGANIZATION_LABEL}`,
      url: `${ASSIGN_ORGANIZATION_URL}/${plan.identifier}`,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage, basePage];

  /** responsible for calling the setOrganization hook on this component from inside the async select. */
  const handleChange = (option: any) => {
    setOrganization(option);
  };

  // props for async select component
  const asyncSelectProps = {
    cacheOptions: true,
    defaultOptions: true,
    loadOptions: loadOrganizations,
    onchange: handleChange,
    setState: setOrganization,
  };

  // methods

  return (
    <div>
      <Helmet>
        <title>{`${ORGANIZATION_LABEL} ${ASSIGNMENT}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mt-3 mb-3 page-title">
        Assign {`${organization.label}`} to {`${plan.title}`}
      </h3>
      <hr />
      {/* select team */}
      <AsyncSelect {...asyncSelectProps} />
      {/* <h4 className="">Assigning "Locations" to "TeamName" for plan "Plan" </h4>
      {/** Tree view */}
    </div>
  );
};

// TODO - this would not work if we did not get a list of the full organizations records on request
/** asynchronously loads a list of teams for the asynchronous select. */
const loadOrganizations = async (serviceClass: typeof OpenSRPService = OpenSRPService) => {
  const serve = new serviceClass(OPENSRP_ORGANIZATION_ENDPOINT);
  const rawOrganizations = await serve.list();
  return formatOptions(rawOrganizations);
};
// TODO - this function is all over the place, or atleast variations of it.
const formatOptions = (organizations: Organization[]) => {
  organizations.map(organization => ({
    label: organization.name,
    value: organization.identifier,
  }));
};
