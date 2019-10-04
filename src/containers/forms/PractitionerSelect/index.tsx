/** uses react select-async multi??? - for practitioner form usage we don't need this to be multi to select several practitioners */
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { OPENSRP_PRACTITIONER_ENDPOINT } from '../../../constants';
import { OpenSRPService } from '../../../services/opensrp';

interface PractitionerSelectProps {
  serviceClass: typeof OpenSRPService;
  onChangeHandler?: (value: string[]) => void;
  isMulti: boolean;
}
const defaultPractitionerSelectProps = {
  isMulti: true,
  serviceClass: OpenSRPService,
};

const PractitionerSelect: React.FC<PractitionerSelectProps> = props => {
  const { serviceClass, onChangeHandler, isMulti } = props;

  const formatOptions = (entries: any[]): Array<{ label: string; value: string }> => {
    return entries.map(entry => ({ label: entry.username, value: entry.identifier }));
  };

  const changeHandler = (values: any[]) => {
    if (typeof onChangeHandler !== 'undefined') {
      // list of ids
      const selectedOptionsIds = values.map(value => value.value);
      onChangeHandler(selectedOptionsIds);
    }
  };

  const promiseOptions = async () => {
    const serve = new serviceClass(OPENSRP_PRACTITIONER_ENDPOINT);
    const options = await serve.list();
    return formatOptions(options);
  };

  return (
    <AsyncSelect
      isMulti={isMulti}
      cacheOptions={true}
      defaultOptions={true}
      loadOptions={promiseOptions}
      onChange={changeHandler}
    />
  );
};

PractitionerSelect.defaultProps = defaultPractitionerSelectProps;

export default PractitionerSelect;
