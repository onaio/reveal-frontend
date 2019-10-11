/** wrapper around react-select component that enables one
 * to select a single user from openmrs
 */
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import { OpenSRPService } from '../../../../services/opensrp';

const OPENMRS_USERS_REQUEST_PAGE_SIZE = 100;

// props interface to UserIdSelect component
export interface Props {
  onChange?: (value: string) => void;
  serviceClass: typeof OpenSRPService;
}

export const defaultProps = {
  serviceClass: OpenSRPService,
};

interface Option {
  label: string;
  value: string;
}

/** interface describing a user from openmrs */
interface OpenMRSUser {
  id: string;
}

/** The UserIdSelect component */
export const UserIdSelect: React.FC<Props> = props => {
  const { onChange } = props;
  const [openMRSUsers, setOpenMRSUsers] = useState<OpenMRSUser[]>([]);

  /** calls the prop.onChange with only the userId
   * @param {ValueType<Option>} option - the value in the react-select
   */
  const changeHandler = (option: ValueType<Option>) => {
    if (option !== null && option !== undefined && onChange) {
      onChange((option! as Option).value);
    }
  };

  /** Pulls all openMRS users info and puts in store */
  const loadOpenMRSUsers = async (service: typeof OpenSRPService = OpenSRPService) => {
    const currentUserIndex = 0;
    let filterParams = {
      page_size: OPENMRS_USERS_REQUEST_PAGE_SIZE,
      start_index: currentUserIndex,
    };
    const serve = new service('user');
    let responseSize: number = 0;

    do {
      serve.list(filterParams).then((response: { results: OpenMRSUser[] }) => {
        const userData = response.results;
        responseSize = userData.length;
        filterParams = {
          ...filterParams,
          start_index: filterParams.start_index + responseSize,
        };
        // TODO - candidate for setState on unmounted component error})
        setOpenMRSUsers(userData);
      });
    } while (responseSize === OPENMRS_USERS_REQUEST_PAGE_SIZE);
  };

  useEffect(() => {
    loadOpenMRSUsers();
  });

  const options = openMRSUsers.map(user => ({ label: user.id, value: user.id }));

  return (
    <Select
      isMulti={true}
      cacheOptions={true}
      defaultOptions={true}
      options={options}
      onChange={changeHandler}
      isSearchable={true}
    />
  );
};
UserIdSelect.defaultProps = defaultProps;
export default UserIdSelect;
