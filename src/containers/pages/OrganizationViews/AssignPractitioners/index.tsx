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
import { keyBy, values } from 'lodash';
import React, { useState } from 'react';
import Helmet from 'react-helmet';
import AsyncSelect from 'react-select/async';
import { ActionTypes, OptionsType, ValueType } from 'react-select/src/types';
import { Button } from 'reactstrap';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  ADD,
  ASSIGN,
  CREATE_ORGANIZATION_URL,
  EDIT_ORGANIZATION_URL,
  EDIT_TEAM,
  HOME,
  HOME_URL,
  NEW_TEAM,
  OPENSRP_ORG_PRACTITIONER_ENDPOINT,
  OPENSRP_PRACTITIONER_ENDPOINT,
  ORGANIZATIONS_LABEL,
  ORGANIZATIONS_LIST_URL,
  PRACTITIONERS,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import { Practitioner } from '../../../../store/ducks/opensrp/practitioners';

/** Props for AssignPractitioner component */
interface AssignPractitionerProps {
  allPractitionersApi: string;
  practitionersByOrgApi: string;
  serviceClass: typeof OpenSRPService;
}

/** default props for AssignPractitioner component */
const defaultAssignPractitionerProps: AssignPractitionerProps = {
  allPractitionersApi: OPENSRP_PRACTITIONER_ENDPOINT,
  practitionersByOrgApi: OPENSRP_ORG_PRACTITIONER_ENDPOINT,
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

/** AssignPractitioner component */
const AssignPractitioner: React.FC<AssignPractitionerProps> = props => {
  const { serviceClass, allPractitionersApi, practitionersByOrgApi } = props;
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
  // const orderOptions = (options: OptionsType<SelectedOption>): OptionsType<SelectedOption> => {
  //   /** orders those with isFixed first then those with isFixed false */
  //   const clonedOptions = cloneDeep(options);
  //   const predicate = (a: any, b: any) => {
  //     if (a.isFixed && b.isFixed) {
  //       return 0;
  //     }
  //     if (a.isFixed && !b.isFixed) {
  //       return -1;
  //     }
  //     if (!a.isFixed && b.isFixed) {
  //       return 1;
  //     }
  //   };
  //   return clonedOptions.sort(predicate);
  // };

  // TODO - Hack in this: typings for the changeHandler function.
  /** This sets the state selectedOptions
   * @param {ValueType<SelectedOption>} -  the so far selected options
   * @param {ActionMeta} - information on the change event; custom react-select event
   */
  const changeHandler = (chosenOptions: any[], { action, removedValue }: any) => {
    if (!chosenOptions) {
      return;
    }
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

  const addHandler = () => {
    const stringValues = selectedOptions.map(option => option.value);
  };

  // Props

  // breadcrumb props
  const basePage = {
    label: ORGANIZATIONS_LABEL,
    url: ORGANIZATIONS_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: 'Assign Practitioners',
      url: '/teams/assignPractitioners',
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
      {/* section for displaying already Added practitioners to this organization */}
      {selectedOptions.map((option, index) => (
        <section key={index}>
          <span>{option.value}</span>
          <input
            type="hidden"
            readOnly={true}
            name={option.label}
            id={option.value}
            value={option.label}
          />
        </section>
      ))}
      <AsyncSelect
        styles={styles}
        isClearable={selectedOptions.some(option => !option.isFixed)}
        isMulti={true}
        cacheOptions={true}
        defaultOptions={true}
        loadOptions={promiseOptions}
        onChange={changeHandler}
      />
      <Button onclick={addHandler}>{`${ADD} ${PRACTITIONERS}`}</Button>
    </div>
  );
};

AssignPractitioner.defaultProps = defaultAssignPractitionerProps;

export default AssignPractitioner;
