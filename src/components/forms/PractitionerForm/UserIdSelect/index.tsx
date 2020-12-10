/** wrapper around react-select component that enables one
 * to select a single user. the selected user
 * should not be mapped to any existing practitioner
 */
import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import { PRACTITIONER_REQUEST_PAGE_SIZE, USERS_REQUEST_PAGE_SIZE } from '../../../../configs/env';
import { SELECT, USERS_FETCH_ERROR } from '../../../../configs/lang';
import {
  OPENSRP_KEYCLOAK_PARAM,
  OPENSRP_USERS_COUNT_ENDPOINT,
  OPENSRP_USERS_ENDPOINT,
} from '../../../../constants';
import { getAllPractitioners } from '../../../../containers/pages/PractitionerViews/helpers/serviceHooks';
import { displayError } from '../../../../helpers/errors';
import { reactSelectNoOptionsText } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import { Practitioner } from '../../../../store/ducks/opensrp/practitioners';

// props interface to UserIdSelect component
export interface Props {
  allPractitioners: Practitioner[];
  onChangeHandler?: (value: OptionTypes) => void;
  serviceClass: typeof OpenSRPService;
  showPractitioners: boolean /** show users that are already mapped to a practitioner */;
  className: string;
  ReactSelectDefaultValue: Option;
  /** if we are only interested in the userName -> affects how a single option
   *    in the dropdown looks like i.e if the value will be the userId or the userName;
   */
  userNameAsValue: boolean;
}

/** default props for UserIdSelect component */
export const defaultProps = {
  ReactSelectDefaultValue: { label: '', value: '' },
  allPractitioners: [] as Practitioner[],
  className: '',
  serviceClass: OpenSRPService,
  showPractitioners: false,
  userNameAsValue: false,
};

/** interface for each select dropdown option */
export interface Option {
  label: string;
  value: string;
}

/** interface describing a user */
interface User {
  access?: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };
  createdTimestamp?: number;
  disableableCredentialTypes?: string[];
  email?: string;
  emailVerified?: boolean;
  enabled?: boolean;
  firstName?: string;
  id: string;
  lastName?: string;
  notBefore?: number;
  requiredActions?: string[];
  totp?: boolean;
  username: string;
}

/** our custom for the option object passed to onChangeHandler by react-select
 * we have intentionally excluded ValueTypeOptions<Option> since this would only be used
 * when react-select has to pass an array of options, i.e. in case of multi react select.
 */
export type OptionTypes = Option | null | undefined;

/** The UserIdSelect component */
export const UserIdSelect = (props: Props) => {
  const { onChangeHandler, userNameAsValue } = props;
  const [users, setUsers] = useState<User[]>([]);
  const [countFetchError, setCountFetchError] = useState<string>('');
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

  // fetch total number of users
  const fetchUsersCount = async () => {
    const serve = new props.serviceClass(OPENSRP_USERS_COUNT_ENDPOINT);
    const response = await serve.list().catch(err => {
      setCountFetchError(USERS_FETCH_ERROR);
      displayError(err);
    });
    return response;
  };

  /** Pulls all users data */
  const loadUsers = async () => {
    let filterParams = {
      page_size: USERS_REQUEST_PAGE_SIZE,
      source: OPENSRP_KEYCLOAK_PARAM,
      start_index: 0,
    };
    const serve = new props.serviceClass(OPENSRP_USERS_ENDPOINT);
    const allUsers = [];
    let response: User[];
    const usersCount: number = await fetchUsersCount();
    if (typeof usersCount !== 'undefined') {
      do {
        response = await serve.list(filterParams).catch(err => {
          displayError(err);
        });
        allUsers.push(...response);

        // modify filter params to point to next page
        const responseSize = response.length;
        filterParams = {
          ...filterParams,
          start_index: filterParams.start_index + responseSize,
        };
      } while (filterParams.start_index < usersCount);
    }
    return allUsers;
  };

  /** depending on the value of showPracitioners; it filters out User objects that have
   * already been mapped to an existing practitioner, this is an effort towards ensuring a 1-1
   * mapping between a user and a practitioner entity
   */
  const loadData = async () => {
    const allUsers = await loadUsers();
    setUsers(allUsers);
    setSelectIsLoading(false);
    // cease execution irregardless of whether component is mounted
    if (props.showPractitioners) {
      return;
    }
    await getAllPractitioners(props.serviceClass, PRACTITIONER_REQUEST_PAGE_SIZE, 1, true);
  };

  useEffect(() => {
    try {
      loadData().catch(err => displayError(err));
    } catch (err) {
      displayError(err);
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!props.showPractitioners) {
      const practitionerUserIds = props.allPractitioners.map(practitioner => practitioner.userId);
      const unMatchedUsers = users.filter(user => !practitionerUserIds.includes(user.id));
      setUsers(unMatchedUsers);
      setSelectIsLoading(false);
    }
  }, [props.allPractitioners]);

  const options = React.useMemo(() => {
    return users
      .map((user: User) => ({
        label: user.username,
        value: userNameAsValue ? user.username : user.id,
      }))
      .sort((userA, userB) => {
        const userALabel = userA.label;
        const userBLabel = userB.label;
        return userALabel === userBLabel ? 0 : userALabel > userBLabel ? 1 : -1;
      });
  }, [users]);

  return !countFetchError.length ? (
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
  ) : (
    <div>{countFetchError}</div>
  );
};

UserIdSelect.defaultProps = defaultProps;
export default UserIdSelect;

/** interface for paginated response got from openSRP
 * endpoint for getting users.
 */
export interface UserResponse {
  links: Array<{ rel: string; uri: string }>;
  results: User[];
}
