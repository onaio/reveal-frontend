import { FieldProps } from 'formik';
import React from 'react';
import JurisdictionSelect, { JurisdictionSelectProps } from '../JurisdictionSelect';
const LocationSelect = (props: JurisdictionSelectProps & FieldProps) => {
  const newProps = {
    ...props,
    loadLocations: true,
  };
  return <JurisdictionSelect {...newProps} />;
};
export default LocationSelect;
