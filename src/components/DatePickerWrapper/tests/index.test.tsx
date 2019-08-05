import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Field, FieldProps, FormikHandlers } from 'formik';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import DatePickerWrapper from '..';
import { DATE_FORMAT } from '../../../configs/env';
import props from './fixtures';

const history = createBrowserHistory();

describe('components/DatePickerWrapper', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const handleChange = () => jest.fn();
    shallow(<DatePickerWrapper selected={new Date()} onChange={handleChange} {...props} />);
  });
});
