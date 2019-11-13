/** wrapper around react-select component that enables one
 * to select a single user from openmrs
 */
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import { OPENMRS_USERS_REQUEST_PAGE_SIZE } from '../../../../configs/env';
import { OPENSRP_PRACTITIONER_ENDPOINT, OPENSRP_USERS_ENDPOINT } from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import { Practitioner } from '../../../../store/ducks/opensrp/practitioners';

// props interface to UserIdSelect component
export interface Props {
  onChangeHandler?: (value: Option) => void;
  serviceClass: typeof OpenSRPService;
}

/** default props for UserIdSelect component */
export const defaultProps = {
  serviceClass: OpenSRPService,
};

/** interface for each select dropdown option */
export interface Option {
  label: string;
  value: string;
}

/** interface describing a user from openmrs */
interface OpenMRSUser {
  person: {
    display: string;
  };
  display: string;
  uuid: string;
}

/** The UserIdSelect component */
export const UserIdSelect: React.FC<Props> = props => {
  const { onChangeHandler } = props;
  const [openMRSUsers, setOpenMRSUsers] = useState<OpenMRSUser[]>([]);
  const [selectIsLoading, setSelectIsLoading] = useState<boolean>(true);

  /** calls the prop.onChange with the selected option as argument
   * @param {ValueType<Option>} option - the value in the react-select
   */
  const changeHandler = (option: ValueType<Option>) => {
    if (option !== null && option !== undefined && onChangeHandler) {
      onChangeHandler(option as Option);
    }
  };

  /** Pulls all openMRS users info and puts in store */
  const loadOpenMRSUsers = async (service: typeof OpenSRPService = OpenSRPService) => {
    const currentCountIndex = 0;
    let filterParams = {
      page_size: OPENMRS_USERS_REQUEST_PAGE_SIZE,
      start_index: currentCountIndex,
    };
    const serve = new service(OPENSRP_USERS_ENDPOINT);
    let responseSize: number = 100;
    const allOpenMRSUsers = [];

    /**while any request returns the maximum request size:.
     * assume there is more data and make another request,
     * else know we just got the last page and stop making further requests
     */
    while (responseSize === OPENMRS_USERS_REQUEST_PAGE_SIZE) {
      const userData = await serve.list(filterParams);
      responseSize = userData.results.length;
      filterParams = {
        ...filterParams,
        start_index: filterParams.start_index + responseSize,
      };
      allOpenMRSUsers.push(...userData.results);
    }
    return allOpenMRSUsers;
  };

  useEffect(() => {
    try {
      loadUnmatchedUsers();
    } catch (err) {
      /** expected error is setState on unmounted component
       */
    }
  }, []);

  /** filters out openMRs User objects that have already been mapped to an existing
   * practitioner, this is an effort towards ensuring a 1-1 mapping between an openMRS user
   * and a practitioner entity
   */
  const loadUnmatchedUsers = async () => {
    const practitioners: Practitioner[] = await new props.serviceClass(
      OPENSRP_PRACTITIONER_ENDPOINT
    ).list();
    const allOpenMRSUsers = await loadOpenMRSUsers();

    const practitionerUserIds = practitioners.map(practitioner => practitioner.userId);
    const unMatchedUsers = allOpenMRSUsers.filter(user => !practitionerUserIds.includes(user.uuid));
    setSelectIsLoading(false);
    setOpenMRSUsers(unMatchedUsers);
  };

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
      cacheOptions={true}
      isLoading={selectIsLoading}
      defaultOptions={true}
      options={options}
      onChange={changeHandler}
      isSearchable={true}
    />
  );
};
UserIdSelect.defaultProps = defaultProps;
export default UserIdSelect;
