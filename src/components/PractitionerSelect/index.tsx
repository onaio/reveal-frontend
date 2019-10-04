/** Wraps react select multi async to provide a form input that
 * pulls and selects at least one practitioner
 */
import { cloneDeep, keyBy, values } from 'lodash';
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { ActionTypes, OptionsType } from 'react-select/src/types';
import { OPENSRP_PRACTITIONER_ENDPOINT } from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import { Practitioner } from '../../store/ducks/opensrp/practitioners';

/** Props for PractitionerSelect component */
interface PractitionerSelectProps {
  allPractitionersApi: string;
  practitionersByOrgApi: string;
  serviceClass: typeof OpenSRPService;
  onChangeHandler?: (value: string[]) => void;
}

/** default props for PractitionerSelect component */
const defaultPractitionerSelectProps: PractitionerSelectProps = {
  allPractitionersApi: OPENSRP_PRACTITIONER_ENDPOINT,
  practitionersByOrgApi: '',
  serviceClass: OpenSRPService,
};

/** custom styling for fixed options */
const styles = {
  multiValue: (base: any, state: any) => {
    return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
  },
  multiValueLabel: (base: any, state: any) => {
    return state.data.isFixed
      ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
      : base;
  },
  multiValueRemove: (base: any, state: any) => {
    return state.data.isFixed ? { ...base, display: 'none' } : base;
  },
};

/** interface of an option in the component's state */
interface SelectedOption {
  readonly label: string;
  readonly value: string;
  readonly isFixed: boolean;
}

/** PractitionerSelect component */
const PractitionerSelect: React.FC<PractitionerSelectProps> = props => {
  const { serviceClass, onChangeHandler, allPractitionersApi, practitionersByOrgApi } = props;
  const [selectedOptions, setSelectedOptions] = useState<OptionsType<SelectedOption>>([]);

  /** formats Practitioner json object structure into a selectedOption object structure
   * @param {Practitioner []} practitioners - list of practitioner json objects
   * @param {boolean} isFixed - value of isFixed; option will be fixed if its already assigned
   * to organization
   * @return {OptionsType<SelectedOption>}
   */
  const formatOptions = (
    practitioners: Practitioner[],
    isFixed: boolean = false
  ): OptionsType<SelectedOption> =>
    practitioners.map(entry => ({
      isFixed,
      label: entry.username,
      value: entry.identifier,
    }));

  // TODO - how does this work with lodash's sort.
  /** sorts the options before passed to the async select such that
   * fixed options are displayed first in the select ui
   * @params {OptionType<SelectedOption>} - all formatted fetched practitioners
   */
  const orderOptions = (options: OptionsType<SelectedOption>): OptionsType<SelectedOption> => {
    /** orders those with isFixed first then those with isFixed false */
    const clonedOptions = cloneDeep(options);
    const predicate = (a: any, b: any) => {
      if (a.isFixed && b.isFixed) {
        return 0;
      }
      if (a.isFixed && !b.isFixed) {
        return -1;
      }
      if (!a.isFixed && b.isFixed) {
        return 1;
      }
    };
    return clonedOptions.sort(predicate);
  };

  /** This sets the state selectedOptions
   * @param {OptionsType<SelectedOption>} -  the so far selected options
   * @param {ActionMeta} - information on the change event; custom react-select event
   */
  const changeHandler = (
    chosenOptions: OptionsType<SelectedOption>,
    { action, removedValue }: { action: ActionTypes; removedValue: SelectedOption }
  ) => {
    if (typeof onChangeHandler !== 'undefined') {
      switch (action) {
        case 'remove-value':
        case 'pop-value':
          if (removedValue.isFixed) {
            return;
          }
          break;
        case 'clear':
          chosenOptions = chosenOptions.filter(v => !v.isFixed);
      }
    }
    setSelectedOptions(chosenOptions);
  };

  /** merges the practitioner records and returns them as  a promise */
  const promiseOptions = async () => {
    // we need this to merge the practitioner records : those that belong to an
    // organization and those that are just fetched
    const allPractitioners = await loadAllPractitioners();
    const orgPractitioners = await loadOrgPractitioners();
    // for now just brute force this s***f
    const mergedOptions = {
      ...keyBy(allPractitioners, option => option.value),
      ...keyBy(orgPractitioners, option => option.value),
    };
    return values(mergedOptions);
  };

  /** load practitioners that belong to this organization */
  const loadOrgPractitioners = async () => {
    const serve = new serviceClass(allPractitionersApi);
    const orgPractitioners = await serve.list();
    return formatOptions(orgPractitioners, true);
  };

  /** load all practitioners at least all of those returned
   * in a single call to Practitioners endpoint
   */
  const loadAllPractitioners = async () => {
    const serve = new serviceClass(practitionersByOrgApi);
    const allPractitioners = await serve.list();
    return formatOptions(allPractitioners);
  };

  return (
    <div>
      {/* section for displaying already Added practitioners to this organization */}
      <AsyncSelect
        styles={styles}
        isClearable={selectedOptions.some(option => !option.isFixed)}
        isMulti={true}
        cacheOptions={true}
        defaultOptions={true}
        loadOptions={promiseOptions}
        onChange={changeHandler}
      />
      {/**  Lets add a button that when clicked calls the onchangehandler passed as prop to the component*/}
    </div>
  );
};

PractitionerSelect.defaultProps = defaultPractitionerSelectProps;

export default PractitionerSelect;
