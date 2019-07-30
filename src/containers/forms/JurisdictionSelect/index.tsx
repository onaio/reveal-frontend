import React from 'react';
import AsyncSelect from 'react-select/async';
import { OpenSRPService, URLParams } from '../../../services/opensrp';

export interface JurisdictionSelectProps {
  apiEndpoint: string;
  params: URLParams;
  serviceClass: typeof OpenSRPService;
}

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

const JurisdictionSelect = (props: JurisdictionSelectProps) => {
  const { apiEndpoint, params, serviceClass } = props;
  const service = new serviceClass(apiEndpoint);
  const propertiesToFilter = {
    geographicLevel: 0,
  };
  params.properties_filter = getFilterParams(propertiesToFilter);

  return <p>i lov oov</p>;
};

JurisdictionSelect.defaultProps = defaultProps;

export default JurisdictionSelect;
