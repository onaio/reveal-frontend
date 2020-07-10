import { FieldProps } from 'formik';
import React from 'react';
import Select, { ActionMeta, Props as ReactSelectProps, ValueType } from 'react-select';

/** Select option */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * General purpose Formik Select field that uses react-select
 * @param props - the props
 */
export const SelectField = (props: ReactSelectProps & FieldProps) => {
  const { defaultValue, field, form, options } = props;

  const handleChange = (val: ValueType<SelectOption>, _: ActionMeta) => {
    if (val) {
      // multiple select
      if (Array.isArray(val)) {
        form.setFieldValue(
          field.name,
          val.map((option: SelectOption) => option.value)
        );
      }
      // single select
      if ('value' in val) {
        form.setFieldValue(field.name, val.value);
      }
    } else {
      form.setFieldValue(field.name, '');
    }
  };

  return (
    <Select
      className="plan-assignment"
      closeMenuOnScroll={true}
      defaultValue={defaultValue}
      isClearable={true}
      isMulti={true}
      isSearchable={true}
      name={field.name}
      onBlur={field.onBlur}
      onChange={handleChange}
      options={options}
    />
  );
};
