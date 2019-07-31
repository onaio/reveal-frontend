import React, { useState } from 'react';
import makeAnimated from 'react-select/animated';
import AsyncSelect from 'react-select/async';
import { getFilterParams, OpenSRPService, URLParams } from '../../../services/opensrp';

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

/** react-select Option */
interface SelectOption {
  label: string;
  value: string;
}

/**
 * JurisdictionSelect - a cascading select for Jurisdictions
 * Allows you to drill-down Jurisdictions until you select a Focus Area
 * This is simply a Higher Order Component that wraps around AsyncSelect
 */
const JurisdictionSelect = (props: JurisdictionSelectProps) => {
  const { apiEndpoint, params, serviceClass } = props;
  const [parentId, setParentId] = useState<string>('');
  const [hierarchy, setHierarchy] = useState<SelectOption[]>([]);
  const [shouldMenuOpen, setShouldMenuOpen] = useState<boolean>(false);
  const [closeMenuOnSelect, setCloseMenuOnSelect] = useState<boolean>(false);

  const service = new serviceClass(apiEndpoint);
  const propertiesToFilter = {
    ...(parentId === '' && { geographicLevel: 0 }),
    ...(parentId !== '' && { parentId }),
  };
  const paramsToUse = {
    ...params,
    ...(Object.keys(propertiesToFilter).length > 0 && {
      properties_filter: getFilterParams(propertiesToFilter),
    }),
  };

  const animatedComponents = makeAnimated();

  /** Get select options from OpenSRP as a promise */
  const promiseOptions = () =>
    new Promise(resolve =>
      resolve(
        service.list(paramsToUse).then((e: JurisdictionOption[]) => {
          const options = e.map(item => {
            return { label: item.properties.name, value: item.id };
          });
          if (hierarchy.length > 0) {
            const labels = hierarchy.map(j => j.label).join(' > ');
            return [
              {
                label: labels,
                options,
              },
            ];
          }
          return options;
        })
      )
    );

  /**
   * onChange callback
   * unfortunately we have to set the type of option as any (for now)
   */
  const handleChange = () => (option: any) => {
    const optionVal = option as { label: string; value: string };
    if (optionVal && optionVal.value) {
      // we are going to check if the current option has children
      // and if it does, we set it as the new parentId

      const newParamsToUse = {
        ...params,
        properties_filter: getFilterParams({ parentId: optionVal.value }),
      };
      service.list(newParamsToUse).then(e => {
        setShouldMenuOpen(true);
        if (e.length > 0) {
          setParentId(optionVal.value);

          hierarchy.push(optionVal);
          setHierarchy(hierarchy);

          setCloseMenuOnSelect(false);
        } else {
          setCloseMenuOnSelect(true);
          setShouldMenuOpen(false);
        }
      });
    } else {
      // most probably the select element was reset, so we reset the state vars
      setParentId('');
      setHierarchy([]);
      setShouldMenuOpen(false);
      setCloseMenuOnSelect(false);
    }
  };

  return (
    <div>
      <AsyncSelect
        /** we are using the key as hack to reload the component when the parentId changes */
        key={parentId}
        name="jurisdiction"
        bsSize="lg"
        defaultMenuIsOpen={shouldMenuOpen}
        closeMenuOnSelect={closeMenuOnSelect}
        components={animatedComponents}
        placeholder="Select Focus Area"
        aria-label="Select Focus Area"
        onChange={handleChange()}
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
