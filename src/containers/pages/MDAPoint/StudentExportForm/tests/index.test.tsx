import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import StudentExportForm from '..';

describe('components/forms/StudentExportForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<StudentExportForm />);
  });

  it('renders correctly', () => {
    // fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const wrapper = mount(<StudentExportForm />);

    expect(toJson(wrapper.find('Label'))).toMatchSnapshot('jurisdiction-select form label');
    expect(toJson(wrapper.find('#studentexportform-submit-button button'))).toMatchSnapshot(
      'submit button'
    );
    wrapper.unmount();
  });
});
