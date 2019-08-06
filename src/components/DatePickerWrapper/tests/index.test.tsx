import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Field, FieldProps, FormikHandlers } from 'formik';
import { Formik } from 'formik';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import DatePickerWrapper from '..';
import { DATE_FORMAT } from '../../../configs/env';
import props from './fixtures';

describe('components/DatePickerWrapper', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const handleChange = () => jest.fn();
    shallow(<DatePickerWrapper selected={new Date()} onChange={handleChange} {...props} />);
  });

  it('renders without crashing with Field component', () => {
    const handleChange = () => jest.fn();
    shallow(
      <Formik>
        <Field
          required={true}
          type="date"
          name="start"
          id="start"
          dateFormat={DATE_FORMAT}
          component={DatePickerWrapper}
          onChange={handleChange}
        />
      </Formik>
    );
  });

  it('onHandle change is called when date is chosen', () => {
    const handleChange = jest.fn();
    const wrapper = mount(
      <DatePickerWrapper selected={new Date()} onChange={handleChange} {...props} />
    );
    wrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-01' } });
    expect(handleChange.mock.calls.length).toBe(1);
    wrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-12' } });
    expect(handleChange.mock.calls.length).toBe(2);
    wrapper.unmount();
  });

  it('onHandleChange is called when date is chosen with FieldComponent', () => {
    const handleChange = jest.fn();
    const fieldWrapper = mount(
      <Formik>
        <Field
          required={true}
          type="date"
          name="start"
          id="start"
          dateFormat={DATE_FORMAT}
          component={DatePickerWrapper}
          onChange={handleChange}
        />
      </Formik>
    );
    fieldWrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-01' } });
    expect(handleChange.mock.calls.length).toBe(1);
    fieldWrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-12' } });
    expect(handleChange.mock.calls.length).toBe(2);
    fieldWrapper.unmount();
  });

  it('passes the correct date to onHandle change when date is chosen with FieldComponent', () => {
    const handleChange = jest.fn();
    const fieldWrapper = mount(
      <Formik>
        <Field
          required={true}
          type="date"
          name="start"
          id="start"
          dateFormat={DATE_FORMAT}
          component={DatePickerWrapper}
          onChange={handleChange}
        />
      </Formik>
    );
    fieldWrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-01' } });
    expect(fieldWrapper.getDOMNode().getElementsByTagName('input')[0].value).toBe('2018-01-01');
    fieldWrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-12' } });
    expect(fieldWrapper.getDOMNode().getElementsByTagName('input')[0].value).toBe('2018-01-12');
    fieldWrapper.unmount();
  });

  it('passes the correct date to onHandle change when date is chosen', () => {
    const handleChange = jest.fn();
    const wrapper = mount(
      <DatePickerWrapper selected={new Date()} onChange={handleChange} {...props} />
    );
    wrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-01' } });
    expect(wrapper.getDOMNode().getElementsByTagName('input')[0].value).toBe('2018-01-01');
    wrapper
      .find('.react-datepicker__input-container > input')
      .simulate('change', { target: { value: '2018-01-12' } });
    expect(wrapper.getDOMNode().getElementsByTagName('input')[0].value).toBe('2018-01-12');
    wrapper.unmount();
  });

  it('matches snapshot', () => {
    const handleChange = jest.fn();
    const wrapper = mount(
      <DatePickerWrapper selected={new Date(2019, 1, 1)} onChange={handleChange} {...props} />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('matches snapshot with FieldComponent', () => {
    const handleChange = jest.fn();
    const wrapper = mount(
      <Formik>
        <Field
          required={true}
          type="date"
          name="start"
          id="start"
          dateFormat={DATE_FORMAT}
          component={DatePickerWrapper}
          onChange={handleChange}
        />
      </Formik>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
