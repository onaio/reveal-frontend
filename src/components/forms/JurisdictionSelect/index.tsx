import { Dictionary } from '@onaio/utils/dist/types/types';
import { FieldConfig, FieldProps, FormikProps } from 'formik';
import React, { useState } from 'react';
import AsyncSelect, { Props as AsyncSelectProps } from 'react-select/async';
import { SELECT } from '../../../configs/lang';
import { OPENSRP_ACTIVE, OPENSRP_FIND_BY_PROPERTIES, OPENSRP_LOCATION } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { reactSelectNoOptionsText } from '../../../helpers/utils';
import { getFilterParams, OpenSRPService, URLParams } from '../../../services/opensrp';
import { NOT_AVAILABLE } from '../../TreeWalker/constants';
import './style.css';

/** interface for jurisdiction options
 * These are received from the OpenSRP API
 */
export interface JurisdictionOption {
  id: string;
  properties: {
    status: string;
    name: string;
    geographicLevel: number;
    version: string | number;
    fi_classification: string;
  };
  serverVersion: number;
  type: 'Feature';
}

/** react-select Option */
export interface SelectOption {
  fiStatus: string;
  label: string;
  value: string;
}

/** JurisdictionSelect props */
export interface JurisdictionSelectProps<T = SelectOption> extends AsyncSelectProps<T> {
  apiEndpoint: string /** the OpenSRP API endpoint */;
  cascadingSelect: boolean /** should we have a cascading select or not */;
  params: URLParams /** extra URL params to send to OpenSRP */;
  serviceClass: typeof OpenSRPService /** the OpenSRP service */;
  promiseOptions: (
    service: OpenSRPService,
    parameters: Dictionary,
    hierarchy: SelectOption[],
    jurisdictionStatus: boolean,
    setFinalLocation: (value: boolean) => void,
    setJurisdictionParam: (value: boolean) => void,
    handleLoadOptionsPayload: (
      jurisdictionApiPayload: JurisdictionOption[],
      jurisdictionStatus: boolean,
      setFinalLocation: (value: boolean) => void,
      hierarchy: SelectOption[],
      setJurisdictionParam: (value: boolean) => void,
      resolve: any
    ) => JurisdictionOption[] // Handles jurisdiction payload from location endpoint
  ) => Promise<any>; // Todo: Add  a more specific type
  handleChange: (
    params: Dictionary,
    isJurisdiction: boolean,
    service: OpenSRPService,
    option: SelectOption,
    hierarchy: SelectOption[],
    cascadingSelect: boolean,
    lowestLocation: boolean,
    loadLocations: boolean,
    setSelectShouldMenuOpen: (value: boolean) => void,
    setSelectParentId: (value: string) => void,
    setSelectHierarchy: (value: SelectOption[]) => void,
    setCloseMenuOnSelect: (value: boolean) => void,
    setSelectIsJurisdiction: (value: boolean) => void,
    setSelectLowestLocation: (value: boolean) => void,
    labelFieldName: string,
    fiStatusFieldName: string,
    form: FormikProps<any>,
    field: FieldConfig,
    handleChangeWithOptions: (
      optionVal: SelectOption,
      newParamsToUse: Dictionary,
      service: OpenSRPService,
      hierarchy: SelectOption[],
      cascadingSelect: boolean,
      lowestLocation: boolean,
      loadLocations: boolean,
      setSelectShouldMenuOpen: (value: boolean) => void,
      setSelectParentId: (value: string) => void,
      setSelectHierarchy: (value: SelectOption[]) => void,
      setSelectCloseMenuOnSelect: (value: boolean) => void,
      setSelectIsJurisdiction: (value: boolean) => void,
      labelFieldName: string,
      fiStatusFieldName: string,
      form: FormikProps<any>,
      field: FieldConfig
    ) => void, // Handles select changes with options selected
    handleChangeWithoutOptions: (
      setSelectShouldMenuOpen: (value: boolean) => void,
      setSelectParentId: (value: string) => void,
      setSelectHierarchy: (value: SelectOption[]) => void,
      setSelectCloseMenuOnSelect: (value: boolean) => void,
      setSelectIsJurisdiction: (value: boolean) => void,
      setSelectLowestLocation: (value: boolean) => void,
      form: FormikProps<any>,
      field: FieldConfig
    ) => void // Handles select changes with no options selected
  ) => void; // Async select onchange callback
}
/**
 *
 * @param jurisdictionSelectApiPayload payload from location api
 * @param jurisdictionStatus  flag that determines what is to be loaded location or jurisdiction
 * @param setSelectFinalLocation  sets if we are at location level
 * @param hierarchy Drill down hierarchy list
 * @param setSelectJurisdictionParam  sets jurisdictionparam value on state
 * @param resolve Promise resolve
 */
export const handleLoadOptionsPayload = (
  jurisdictionSelectApiPayload: JurisdictionOption[],
  jurisdictionStatus: boolean,
  setSelectFinalLocation: (value: boolean) => void,
  hierarchy: SelectOption[],
  setSelectJurisdictionParam: (value: boolean) => void,
  resolve: any // unfortunately we have to set the type of option as any (for now)
) => {
  /** Check if payload has no name property then use id instead
   *  If there is no location return no options
   */
  if (!jurisdictionStatus) {
    setSelectFinalLocation(true);
    if (jurisdictionSelectApiPayload.length >= 1 && !jurisdictionStatus) {
      const locationOptions = jurisdictionSelectApiPayload.map(item => {
        return {
          fiStatus: item.properties.fi_classification,
          label: item.properties.name ? item.properties.name : item.id,
          value: item.id,
        };
      });
      if (hierarchy.length > 0) {
        const labels = hierarchy.map(j => j.label).join(' > ');
        setSelectJurisdictionParam(true);
        return resolve([
          {
            label: labels,
            options: locationOptions,
          },
        ]);
      }
    } else if (!jurisdictionSelectApiPayload.length) {
      setSelectJurisdictionParam(true);
      return resolve([]);
    }
  }
  const options = jurisdictionSelectApiPayload.map(item => {
    return {
      fiStatus: item.properties.fi_classification,
      label: item.properties.name,
      value: item.id,
    };
  });
  if (hierarchy.length > 0) {
    const labels = hierarchy.map(j => j.label).join(' > ');
    return resolve([
      {
        label: labels,
        options,
      },
    ]);
  }
  resolve(options);
};
/**
 * Loads options from OpenSRP
 * @param service OpenSRP service class
 * @param paramsToUse params to be used when making the call
 * @param hierarchy async select order
 */
export const promiseOptions = (
  service: OpenSRPService,
  paramsToUse: Dictionary,
  hierarchy: SelectOption[],
  jurisdictionStatus: boolean,
  setFinalLocation: (value: boolean) => void,
  setJurisdictionParam: (value: boolean) => void,
  handleSelectLoadOptionsPayload: (
    jurisdictionApiPayload: JurisdictionOption[],
    jurisdictionStatus: boolean,
    setFinalLocation: (value: boolean) => void,
    hierarchy: SelectOption[],
    setJurisdictionParam: (value: boolean) => void,
    resolve: any
  ) => JurisdictionOption[]
) =>
  // tslint:disable-next-line:no-inferred-empty-object-type
  new Promise((resolve, reject) => {
    service
      .list({ ...paramsToUse, is_jurisdiction: jurisdictionStatus })
      .then((jurisdictionApiPayload: JurisdictionOption[]) => {
        handleSelectLoadOptionsPayload(
          jurisdictionApiPayload,
          jurisdictionStatus,
          setFinalLocation,
          hierarchy,
          setJurisdictionParam,
          resolve
        );
      })
      .catch((error: Error) => {
        reject(`OpenSRP service Error ${error}`);
      });
  });

/**
 * Handles async select onchange with options
 * @param optionVal Selected options
 * @param newParamsToUse Params to use for the next api call
 * @param service OpenSRPService
 * @param hierarchy Drill down hierarchy list
 * @param cascadingSelect Toggles async select cascade option true/false
 * @param lowestLocation props that informs if we are at the lowest level
 * @param loadLocations Ownprop that allows drilling down to location level
 * @param setSelectShouldMenuOpen Controls opening asyncselect menu
 * @param setSelectParentId Sets parent id to state
 * @param setSelectHierarchy  Sets select Hierarchy to state
 * @param setSelectCloseMenuOnSelect Controls closing asyncselect menu
 * @param setSelectIsJurisdiction Sets isJurisdiction value to state
 * @param labelFieldName async select label field
 * @param form Formik form Object
 * @param field Formik field config
 */
export const handleChangeWithOptions = (
  optionVal: SelectOption,
  newParamsToUse: Dictionary,
  service: OpenSRPService,
  hierarchy: SelectOption[],
  cascadingSelect: boolean,
  lowestLocation: boolean,
  loadLocations: boolean,
  setSelectShouldMenuOpen: (value: boolean) => void,
  setSelectParentId: (value: string) => void,
  setSelectHierarchy: (value: SelectOption[]) => void,
  setSelectCloseMenuOnSelect: (value: boolean) => void,
  setSelectIsJurisdiction: (value: boolean) => void,
  labelFieldName: string,
  fiStatusFieldName: string,
  form: FormikProps<any>,
  field: FieldConfig
) => {
  service
    .list(newParamsToUse)
    .then((e: JurisdictionOption[]) => {
      setSelectShouldMenuOpen(true);
      if (e.length > 0 && cascadingSelect === true) {
        setSelectParentId(optionVal.value);

        hierarchy.push(optionVal);
        setSelectHierarchy(hierarchy);

        setSelectCloseMenuOnSelect(false);
      } else if (!e.length && loadLocations && !lowestLocation) {
        setSelectIsJurisdiction(false);
        setSelectParentId(optionVal.value);
        hierarchy.push(optionVal);
        setSelectHierarchy(hierarchy);
        setSelectCloseMenuOnSelect(false);
      } else {
        // set the Formik field value
        if (form && field) {
          form.setFieldValue(field.name, optionVal.value);
          form.setFieldTouched(field.name, true);
          if (fiStatusFieldName) {
            const val = optionVal.fiStatus || NOT_AVAILABLE;
            form.setFieldValue(fiStatusFieldName, val);
          }
          if (labelFieldName) {
            form.setFieldValue(labelFieldName, optionVal.label); /** dirty hack */
            form.setFieldTouched(labelFieldName, true); /** dirty hack */
          }
        }

        setSelectCloseMenuOnSelect(true);
        setSelectShouldMenuOpen(false);
      }
    })
    .catch((error: Error) => displayError(error));
};
/**
 * Handles async select onchange with no options
 * @param setSelectShouldMenuOpen Controls opening asyncselect menu
 * @param setSelectParentId Sets parent id to state
 * @param setSelectHierarchy sets drill down hierarchy to state
 * @param setSelectCloseMenuOnSelect Controls closing asyncselect menu
 * @param setSelectIsJurisdiction Sets isJurisdiction value to state
 * @param setSelectLowestLocation Sets lowest location value to state
 * @param form Formik form Object
 * @param field Formik field config
 */
export const handleChangeWithoutOptions = (
  setSelectShouldMenuOpen: (value: boolean) => void,
  setSelectParentId: (value: string) => void,
  setSelectHierarchy: (value: SelectOption[]) => void,
  setSelectCloseMenuOnSelect: (value: boolean) => void,
  setSelectIsJurisdiction: (value: boolean) => void,
  setSelectLowestLocation: (value: boolean) => void,
  form: FormikProps<any>,
  field: FieldConfig,
  fiStatusFieldName: string
) => {
  // most probably the select element was reset, so we reset the state vars
  setSelectParentId('');
  setSelectHierarchy([]);
  setSelectShouldMenuOpen(false);
  setSelectCloseMenuOnSelect(false);
  setSelectLowestLocation(false);
  setSelectIsJurisdiction(true);
  // set the Formik field value
  if (form && field) {
    form.setFieldValue(field.name, '');
    if (fiStatusFieldName) {
      form.setFieldValue(fiStatusFieldName, '');
    }
  }
};
/**
 * onChange callback
 * unfortunately we have to set the type of option as any (for now)
 */
export const handleChange = (
  params: Dictionary,
  isJurisdiction: boolean,
  service: OpenSRPService,
  option: SelectOption,
  hierarchy: SelectOption[],
  cascadingSelect: boolean,
  lowestLocation: boolean,
  loadLocations: boolean,
  setSelectShouldMenuOpen: (value: boolean) => void,
  setSelectParentId: (value: string) => void,
  setSelectHierarchy: (value: SelectOption[]) => void,
  setSelectCloseMenuOnSelect: (value: boolean) => void,
  setSelectIsJurisdiction: (value: boolean) => void,
  setSelectLowestLocation: (value: boolean) => void,
  labelFieldName: string,
  fiStatusFieldName: string,
  form: FormikProps<any>,
  field: FieldConfig,
  handleSelectChangeWithOptions: (
    OptionVal: SelectOption,
    newParamsToUse: Dictionary,
    service: OpenSRPService,
    hierarchy: SelectOption[],
    cascadingSelect: boolean,
    lowestLocation: boolean,
    loadLocations: boolean,
    setSelectShouldMenuOpen: (value: boolean) => void,
    setSelectParentId: (value: string) => void,
    setSelectHierarchy: (value: SelectOption[]) => void,
    setSelectCloseMenuOnSelect: (value: boolean) => void,
    setSelectIsJurisdiction: (value: boolean) => void,
    labelFieldName: string,
    fiStatusFieldName: string,
    form: FormikProps<any>,
    field: FieldConfig
  ) => void,
  handleSelectChangeWithoutOptions: (
    setSelectShouldMenuOpen: (value: boolean) => void,
    setSelectParentId: (value: string) => void,
    setSelectHierarchy: (value: SelectOption[]) => void,
    setSelectCloseMenuOnSelect: (value: boolean) => void,
    setSelectIsJurisdiction: (value: boolean) => void,
    setSelectLowestLocation: (value: boolean) => void,
    form: FormikProps<any>,
    field: FieldConfig,
    fiStatusFieldName: string
  ) => void
) => {
  const optionVal = option;

  if (optionVal && optionVal.value) {
    // we are going to check if the current option has children
    // and if it does, we set it as the new parentId

    const newParamsToUse = {
      ...params,
      is_jurisdiction: isJurisdiction,
      properties_filter: getFilterParams({ parentId: optionVal.value, status: OPENSRP_ACTIVE }),
    };

    handleSelectChangeWithOptions(
      optionVal,
      newParamsToUse,
      service,
      hierarchy,
      cascadingSelect,
      lowestLocation,
      loadLocations,
      setSelectShouldMenuOpen,
      setSelectParentId,
      setSelectHierarchy,
      setSelectCloseMenuOnSelect,
      setSelectIsJurisdiction,
      labelFieldName,
      fiStatusFieldName,
      form,
      field
    );
  } else {
    // most probably the select element was reset, so we reset the state vars
    handleSelectChangeWithoutOptions(
      setSelectShouldMenuOpen,
      setSelectParentId,
      setSelectHierarchy,
      setSelectCloseMenuOnSelect,
      setSelectIsJurisdiction,
      setSelectLowestLocation,
      form,
      field,
      fiStatusFieldName
    );
  }
};
/** default props for JurisdictionSelect */
export const defaultProps: Partial<JurisdictionSelectProps> = {
  apiEndpoint: `${OPENSRP_LOCATION}/${OPENSRP_FIND_BY_PROPERTIES}`,
  cascadingSelect: true,
  handleChange,
  handleChangeWithOptions,
  handleChangeWithoutOptions,
  handleLoadOptionsPayload,
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
    loadLocations,
    apiEndpoint,
    cascadingSelect,
    field,
    form,
    labelFieldName,
    fiStatusFieldName,
    params,
    serviceClass,
  } = props;
  const [parentId, setParentId] = useState<string>('');
  const [hierarchy, setHierarchy] = useState<SelectOption[]>([]);
  const [shouldMenuOpen, setShouldMenuOpen] = useState<boolean>(false);
  const [closeMenuOnSelect, setCloseMenuOnSelect] = useState<boolean>(false);
  const [isJurisdiction, setIsJurisdiction] = useState<boolean>(true);
  const [lowestLocation, setLowestLocation] = useState<boolean>(false);

  const service = new serviceClass(apiEndpoint);
  const propertiesToFilter = {
    status: OPENSRP_ACTIVE,
    ...(parentId === '' && { geographicLevel: 0 }),
    ...(parentId !== '' && { parentId }),
  };
  const paramsToUse = {
    ...params,
    is_jurisdiction: isJurisdiction,
    ...(Object.keys(propertiesToFilter).length > 0 && {
      properties_filter: getFilterParams(propertiesToFilter),
    }),
  };
  const wrapperPromiseOptions: () => Promise<() => {}> = async () => {
    return await props.promiseOptions(
      service,
      paramsToUse,
      hierarchy,
      isJurisdiction,
      setLowestLocation,
      setIsJurisdiction,
      props.handleLoadOptionsPayload
    );
  };
  /**
   * onChange callback
   * unfortunately we have to set the type of option as any (for now)
   */
  const wrapperHandleChange = () => (option: any) =>
    props.handleChange(
      params,
      isJurisdiction,
      service,
      option,
      hierarchy,
      cascadingSelect,
      lowestLocation,
      loadLocations,
      setShouldMenuOpen,
      setParentId,
      setHierarchy,
      setCloseMenuOnSelect,
      setIsJurisdiction,
      setLowestLocation,
      labelFieldName,
      fiStatusFieldName,
      form,
      field,
      props.handleChangeWithOptions,
      props.handleChangeWithoutOptions
    );
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
      onChange={wrapperHandleChange()}
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
