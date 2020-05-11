import { Dictionary } from '@onaio/utils/dist/types/types';
import { FieldProps } from 'formik';
import React, { useEffect, useState } from 'react';
import AsyncSelect, { Props as AsyncSelectProps } from 'react-select/async';
import { SELECT } from '../../../configs/lang';
import { displayError } from '../../../helpers/errors';
import { reactSelectNoOptionsText } from '../../../helpers/utils';
import { getFilterParams, OpenSRPService, URLParams } from '../../../services/opensrp';
import { InterventionType } from '../../../store/ducks/plans';
import './style.css';

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

/** JurisdictionSelect props */
export interface JurisdictionSelectProps<T = SelectOption> extends AsyncSelectProps<T> {
  apiEndpoint: string /** the OpenSRP API endpoint */;
  cascadingSelect: boolean /** should we have a cascading select or not */;
  params: URLParams /** extra URL params to send to OpenSRP */;
  serviceClass: typeof OpenSRPService /** the OpenSRP service */;
  promiseOptions: any;
}
/**
 * Loads options from opensrp
 * @param service Opensrp service class
 * @param paramsToUse params to be used when making the call
 * @param hierarchy async select order
 */
export const promiseOptions = (
  service: OpenSRPService,
  paramsToUse: Dictionary,
  hierarchy: SelectOption[]
) =>
  // tslint:disable-next-line:no-inferred-empty-object-type
  new Promise((resolve, reject) =>
    service
      .list(paramsToUse)
      .then((e: JurisdictionOption[]) => {
        const options = e.map(item => {
          return { label: item.properties.name, value: item.id };
        });
        if (hierarchy.length > 0) {
          const labels = hierarchy.map(j => j.label).join(' > ');
          resolve([
            {
              label: labels,
              options,
            },
          ]);
        }
        resolve(options);
      })
      .catch(error => {
        reject(`Opensrp service Error ${error}`);
      })
  );

/** default props for JurisdictionSelect */
export const defaultProps: Partial<JurisdictionSelectProps> = {
  apiEndpoint: 'location/findByProperties',
  cascadingSelect: true,
  interventionType: null,
  params: {
    is_jurisdiction: true,
    return_geometry: false,
  },
  promiseOptions,
  serviceClass: OpenSRPService,
};

/**
 * JurisdictionSelect - a cascading select for Jurisdictions
 * Allows you to drill-down Jurisdictions until you select a Focus Area
 * This is simply a Higher Order Component that wraps around AsyncSelect
 */
const JurisdictionSelect = (props: JurisdictionSelectProps & FieldProps) => {
  const {
    apiEndpoint,
    cascadingSelect,
    field,
    form,
    labelFieldName,
    params,
    serviceClass,
    interventionType,
  } = props;

  const [parentId, setParentId] = useState<string>('');
  const [hierarchy, setHierarchy] = useState<SelectOption[]>([]);
  const [shouldMenuOpen, setShouldMenuOpen] = useState<boolean>(false);
  const [closeMenuOnSelect, setCloseMenuOnSelect] = useState<boolean>(false);

  /** set state variables to default and clear form input */
  const resetStateVars = () => {
    // reset the state vars
    setParentId('');
    setHierarchy([]);
    setShouldMenuOpen(false);
    setCloseMenuOnSelect(false);
    // set the Formik field value
    if (form && field) {
      form.setFieldValue(field.name, '');
    }
  };

  useEffect(() => {
    if (interventionType === InterventionType.MDAPoint) {
      resetStateVars();
    }
  }, [interventionType]);

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
  const wrapperPromiseOptions: () => Promise<() => {}> = async () => {
    return await props.promiseOptions(service, paramsToUse, hierarchy);
  };
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
      service
        .list(newParamsToUse)
        .then(e => {
          setShouldMenuOpen(true);
          if (e.length > 0 && cascadingSelect === true) {
            setParentId(optionVal.value);

            hierarchy.push(optionVal);
            setHierarchy(hierarchy);

            setCloseMenuOnSelect(false);
          } else {
            // set the Formik field value
            if (form && field) {
              form.setFieldValue(field.name, optionVal.value);
              form.setFieldTouched(field.name, true);
              if (labelFieldName) {
                form.setFieldValue(labelFieldName, optionVal.label); /** dirty hack */
                form.setFieldTouched(labelFieldName, true); /** dirty hack */
              }
            }

            setCloseMenuOnSelect(true);
            setShouldMenuOpen(false);
          }
        })
        .catch(error => displayError(error));
    } else {
      // most probably the select element was reset
      resetStateVars();
    }
  };

  return (
    <AsyncSelect
      /** we are using the key as hack to reload the component when the parentId changes */
      key={parentId}
      name={field ? field.name : 'jurisdiction'}
      bsSize="lg"
      defaultMenuIsOpen={shouldMenuOpen}
      closeMenuOnSelect={closeMenuOnSelect}
      placeholder={props.placeholder ? props.placeholder : SELECT}
      noOptionsMessage={reactSelectNoOptionsText}
      aria-label={props['aria-label'] ? props['aria-label'] : SELECT}
      onChange={handleChange()}
      defaultOptions={true}
      loadOptions={wrapperPromiseOptions}
      isClearable={true}
      cacheOptions={true}
      classNamePrefix="jurisdiction"
      {...props}
    />
  );
};

JurisdictionSelect.defaultProps = defaultProps;

export default JurisdictionSelect;
