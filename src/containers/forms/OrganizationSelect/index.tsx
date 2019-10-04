import reducerRegistry from '@onaio/redux-reducer-registry';
import { FieldProps } from 'formik';
import React, { useEffect, useState } from 'react';
import AsyncSelect, { Props as AsyncSelectProps } from 'react-select/async';
import { OpenSRPService } from '../../../services/opensrp';
import './style.css';

import { connect } from 'react-redux';
import { Store } from 'redux';
import { OPENSRP_ORGANIZATION_ENDPOINT } from '../../../constants';
import store from '../../../store';
import organizationsReducer, {
  fetchOrganizations,
  getOrganizationsArray,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../store/ducks/opensrp/organizations';
import { organizations } from '../../../store/ducks/tests/fixtures';

reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** interface for jurisdiction options
 * These are received from the OpenSRP API
 */
interface OrganizationOption {
  id: string;
  properties: {
    status: string;
    name: string;
    geographicLevel: number;
    version: string | number;
  };
  serverVersion: number;
  type: 'Feature';
}

/** react-select Option */
interface SelectOption {
  label: string;
  value: string;
}

/** OrganizationSelect props */
export interface OrganizationSelectProps {
  // apiEndpoint: string /** the OpenSRP API endpoint */;
  fetchOrganizationsAction: typeof fetchOrganizations;
  organizations: Organization[];
  // params: URLParams /** extra URL params to send to OpenSRP */;
  serviceClass: typeof OpenSRPService /** the OpenSRP service */;
}

/** default props for OrganizationSelect */
const defaultProps: Partial<OrganizationSelectProps> = {
  // apiEndpoint: 'location/findByProperties',
  fetchOrganizationsAction: fetchOrganizations,
  organizations: [],
  // params: {
  //   is_jurisdiction: true,
  //   return_geometry: false,
  // },
  serviceClass: OpenSRPService,
};

/**
 * OrganizationSelect - a cascading select for Jurisdictions
 * Allows you to drill-down Jurisdictions until you select a Focus Area
 * This is simply a Higher Order Component that wraps around AsyncSelect
 */
const OrganizationSelect = (props: OrganizationSelectProps & FieldProps) => {
  const { fetchOrganizationsAction, field, serviceClass } = props;

  const [parentId, setParentId] = useState<string>('');
  const [hierarchy, setHierarchy] = useState<SelectOption[]>([]);
  const [shouldMenuOpen, setShouldMenuOpen] = useState<boolean>(false);
  const [closeMenuOnSelect, setCloseMenuOnSelect] = useState<boolean>(false);

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
   * unfortunately we have to set the type of option as any (for now)
   */
  // const handleChange = () => (option: any) => {};

  const promseOptions = () =>
    new Promise(resolve =>
      resolve(
        organizations.map(o => ({
          label: o.name,
          value: o.identifier,
        }))
      )
    );

  return (
    <AsyncSelect
      /** we are using the key as hack to reload the component when the parentId changes */
      key={parentId}
      name={field ? field.name : 'jurisdiction'}
      bsSize="lg"
      defaultMenuIsOpen={shouldMenuOpen}
      closeMenuOnSelect={closeMenuOnSelect}
      placeholder={'Select'}
      aria-label={'Select'}
      onChange={handleChange()}
      defaultOptions={true}
      loadOptions={promseOptions}
      isClearable={true}
      isMulti={true}
      cacheOptions={true}
      {...props}
    />
  );
};

OrganizationSelect.defaultProps = defaultProps;

export { OrganizationSelect };

// connect to store

const mapStateToProps = (state: Partial<Store>, ownProps: OrganizationSelectProps) => {
  return {
    ...ownProps,
    organizations: getOrganizationsArray(state),
  };
};

const ConnectedOrganizationSelect = connect(mapStateToProps)(OrganizationSelect);

export default ConnectedOrganizationSelect;
