import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import PractitionerForm from '..';
import UserIdSelect from '../UserIdSelect';

describe('src/components/PractitionerForm', () => {
  it('renders without crashing', () => {
    shallow(<PractitionerForm />);
  });

  it('renders correctly', () => {
    // looking for each fields
    const wrapper = mount(<PractitionerForm />);

    // practitioner's name
    const practitionerInput = wrapper.find('input#name');
    expect(practitionerInput.length).toEqual(1);
    expect(toJson(practitionerInput)).toMatchSnapshot('name input');

    // async select to retrieve openMRS username
    const openmrsId = wrapper.find(UserIdSelect);
    expect(openmrsId.length).toBeGreaterThanOrEqual(1);

    // active
    const activeRadioNo = wrapper.find('input#no');
    expect(activeRadioNo.length).toEqual(1);
    expect(toJson(activeRadioNo)).toMatchSnapshot('active field no radio');

    const activeRadioYes = wrapper.find('input#yes');
    expect(activeRadioYes.length).toEqual(1);
    expect(toJson(activeRadioYes)).toMatchSnapshot('active field yes radio');
  });
});
