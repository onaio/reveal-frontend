/** wrapper around react-select component that enables one
 * to select a single user from openMRS. the selected openMRs user
 * should not be mapped to any existing practitioner
 */
import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import { OPENMRS_USERS_REQUEST_PAGE_SIZE } from '../../../../configs/env';
import { SELECT } from '../../../../configs/lang';
import { OPENSRP_PRACTITIONER_ENDPOINT, OPENSRP_USERS_ENDPOINT } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { reactSelectNoOptionsText } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import { Practitioner } from '../../../../store/ducks/opensrp/practitioners';

// props interface to UserIdSelect component
export interface Props {
  onChangeHandler?: (value: OptionTypes) => void;
  serviceClass: typeof OpenSRPService;
  showPractitioners: boolean /** show users that are already mapped to a practitioner */;
  className: string;
  ReactSelectDefaultValue: Option;
}

/** default props for UserIdSelect component */
export const defaultProps = {
  ReactSelectDefaultValue: { label: '', value: '' },
  className: '',
  serviceClass: OpenSRPService,
  showPractitioners: false,
};

/** interface for each select dropdown option */
export interface Option {
  label: string;
  value: string;
}

/** interface describing a user from openMRS */
interface OpenMRSUser {
  person: {
    display: string;
  };
  display: string;
  uuid: string;
}

/** util function that given an OpenMRSResponse, returns
 * whether we can call the openSRP-openMRS proxy for the next page of data
 */
export const thereIsNextPage = (response: OpenMRSResponse): boolean => {
  if (response.links) {
    // check if we have a next link in the links
    const links = response.links;
    return links.filter(link => link.rel === 'next').length > 0;
  }
  return false;
};

/** our custom for the option object passed to onChangeHandler by react-select
 * we have intentionally excluded ValueTypeOptions<Option> since this would only be used
 * when react-select has to pass an array of options, i.e. in case of multi react select.
 */
export type OptionTypes = Option | null | undefined;

/** The UserIdSelect component */
export const UserIdSelect = (props: Props) => {
  const { onChangeHandler } = props;
  const [openMRSUsers, setOpenMRSUsers] = useState<OpenMRSUser[]>([]);
  const [selectIsLoading, setSelectIsLoading] = useState<boolean>(true);
  const isMounted = useRef<boolean>(true);

  /** calls the prop.onChange with the selected option as argument
   * @param {ValueType<Option>} option - the value in the react-select
   */
  const changeHandler = (option: ValueType<Option>) => {
    const localOption = option as Option | null | undefined;
    if (onChangeHandler) {
      onChangeHandler(localOption);
    }
  };

  /** Pulls all openMRS users data */
  const loadOpenMRSUsers = async (service: typeof OpenSRPService = OpenSRPService) => {
    let filterParams = {
      page_size: OPENMRS_USERS_REQUEST_PAGE_SIZE,
      start_index: 0,
    };
    const serve = new service(OPENSRP_USERS_ENDPOINT);
    const allOpenMRSUsers = [];
    let response: OpenMRSResponse;
    do {
      response = await serve.list(filterParams).catch(err => {
        displayError(err);
      });
      allOpenMRSUsers.push(...response.results);

      // modify filter params to point to next page
      const responseSize = response.results.length;
      filterParams = {
        ...filterParams,
        start_index: filterParams.start_index + responseSize,
      };
    } while (thereIsNextPage(response));
    return allOpenMRSUsers;
  };

  /** depending on the value of showPracitioners; it filters out openMRs User objects that have
   * already been mapped to an existing practitioner, this is an effort towards ensuring a 1-1
   * mapping between an openMRS user and a practitioner entity
   */
  const loadUsers = async () => {
    const allOpenMRSUsers = await loadOpenMRSUsers();
    if (props.showPractitioners && isMounted.current) {
      // setState with all unfiltered openMRS users if component is mounted
      setOpenMRSUsers(allOpenMRSUsers);
      setSelectIsLoading(false);
    }
    // cease execution irregardless of whether component is mounted
    if (props.showPractitioners) {
      return;
    }
    const practitioners: Practitioner[] = await new props.serviceClass(
      OPENSRP_PRACTITIONER_ENDPOINT
    ).list();

    const practitionerUserIds = practitioners.map(practitioner => practitioner.userId);
    const unMatchedUsers = allOpenMRSUsers.filter(user => !practitionerUserIds.includes(user.uuid));
    if (isMounted.current) {
      setOpenMRSUsers(unMatchedUsers);
      setSelectIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      loadUsers().catch(err => displayError(err));
    } catch (err) {
      displayError(err);
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const options = React.useMemo(() => {
    return openMRSUsers
      .map((user: OpenMRSUser) => ({
        label: user.display,
        value: user.uuid,
      }))
      .sort((userA, userB) => {
        const userALabel = userA.label;
        const userBLabel = userB.label;
        return userALabel === userBLabel ? 0 : userALabel > userBLabel ? 1 : -1;
      });
  }, [openMRSUsers]);

  return (
    <Select
      className={props.className}
      cacheOptions={true}
      isLoading={selectIsLoading}
      defaultOptions={true}
      options={options}
      onChange={changeHandler}
      isSearchable={true}
      isClearable={true}
      defaultValue={props.ReactSelectDefaultValue}
      placeholder={SELECT}
      noOptionsMessage={reactSelectNoOptionsText}
    />
  );
};

UserIdSelect.defaultProps = defaultProps;
export default UserIdSelect;

/** interface for paginated response got from openSRP
 * openMRS proxy for getting openMRS users.
 */
export interface OpenMRSResponse {
  links: Array<{ rel: string; uri: string }>;
  results: OpenMRSUser[];
}
