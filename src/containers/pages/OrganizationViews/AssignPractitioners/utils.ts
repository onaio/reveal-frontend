import { OptionsType } from 'react-select/src/types';
import { Practitioner } from '../../../../store/ducks/opensrp/practitioners';

/** interface of an option in the component's state */
export interface SelectOption {
  readonly label: string;
  readonly value: string;
  readonly isFixed: boolean;
}

/** custom styling for fixed options */
export const styles = {
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

/** filters options shown in drop down based on the so far typed characters
 * @param {string} inputVal - string literal that is being typed in select
 * @param {OptionsType<SelectOption>} allOptions - options from which user can pick from
 */
export const filterOptions = (
  inputVal: string,
  allOptions: OptionsType<SelectOption>
): OptionsType<SelectOption> => {
  const lowerCaseInput = inputVal.toLocaleLowerCase();
  return allOptions.filter(option =>
    (option as any).label.toLocaleLowerCase().includes(lowerCaseInput)
  );
};

/** formats Practitioner json object structure into a selectedOption object structure
 * @param {Practitioner []} practitioners - list of practitioner json objects
 * @param {boolean} isFixed - value of isFixed; option will be fixed if its already assigned
 * to organization
 * @return {OptionsType<SelectOption>}
 */
export const formatOptions = (
  practitioners: Practitioner[],
  isFixed: boolean = false
): OptionsType<SelectOption> =>
  practitioners.map(entry => ({
    isFixed,
    label: `${entry.username} - ${entry.name}`,
    value: entry.identifier,
  }));
