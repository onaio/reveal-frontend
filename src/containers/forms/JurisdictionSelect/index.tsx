import React from 'react';
import makeAnimated from 'react-select/animated';
import AsyncSelect from 'react-select/async';
import { OpenSRPService, URLParams } from '../../../services/opensrp';

/** JurisdictionSelect props */
export interface JurisdictionSelectProps {
  apiEndpoint: string;
  params: URLParams;
  serviceClass: typeof OpenSRPService;
}

/** default props for JurisdictionSelect */
const defaultProps: JurisdictionSelectProps = {
  apiEndpoint: 'location/findByProperties',
  params: {
    is_jurisdiction: true,
    return_geometry: false,
  },
  serviceClass: OpenSRPService,
};

/** converts filter params object to string
 * @param {URLParams} obj - the object representing filter params
 * @returns {string} filter params as a string
 */
export function getFilterParams(obj: URLParams): string {
  return Object.entries(obj)
    .map(([key, val]) => `${key}:${val}`)
    .join(',');
}

/** interface for jurisdiction options
 * These are received from the OpenSRP API
 */
interface JurisdictionOption {
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

/**
 * JurisdictionSelect - a cascading select for Jurisdictions
 * Allows you to drill-down Jurisdictions until you select a Focus Area
 */
const JurisdictionSelect = (props: JurisdictionSelectProps) => {
  const { apiEndpoint, params, serviceClass } = props;
  const service = new serviceClass(apiEndpoint);
  const propertiesToFilter = {
    geographicLevel: 0,
  };
  const animatedComponents = makeAnimated();
  params.properties_filter = getFilterParams(propertiesToFilter);

  const promiseOptions = () =>
    new Promise(resolve =>
      resolve(
        service.list(params).then((e: JurisdictionOption[]) => {
          return e.map(item => {
            return { label: item.properties.name, value: item.id };
          });
        })
      )
    );

  return (
    <div>
      <AsyncSelect
        name="form"
        bsSize="lg"
        components={animatedComponents}
        placeholder="Select Focus Area"
        aria-label="Select Focus Area"
        defaultOptions={true}
        loadOptions={promiseOptions}
        isClearable={true}
        cacheOptions={true}
      />
    </div>
  );
};

JurisdictionSelect.defaultProps = defaultProps;

export default JurisdictionSelect;
