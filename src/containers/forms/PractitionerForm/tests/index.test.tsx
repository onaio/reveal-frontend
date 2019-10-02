import { mount, shallow } from 'enzyme';
import React from 'react';
import PractitionerForm, { PractitionerFormFields, PractitionerFormProps } from '..';

describe('src/components/practitionerform', () => {
  it('renders correctly', () => {
    // looking for each fields
    const wrapper = mount(<PractitionerForm />);

    // practitioner's name
    const practitionerInput = wrapper.find('input#name');
    expect(practitionerInput.length).toEqual(1);

    // username for practitioner
    const usernameInput = wrapper.find('input#username');
    expect(usernameInput.length).toEqual(1);

    // asyncs select to retrieve openmrs username
    const openmrsId = wrapper.find('#userId');
    expect(openmrsId).not.toBeGreaterThanOrEqual(1);

    // active
    const activeRadioNo = wrapper.find('input#no');
    expect(activeRadioNo.length).toEqual(1);

    const activeRadioYes = wrapper.find('input#yes');
    expect(activeRadioYes.length).toEqual(1);
  });

  it('validates correctly against yup schema', () => {
    // check that errors arise when invalid data is passed in
    const serviceMock: any = jest.fn();
    const updateMock: any = jest.fn();

    const props = {
      serviceClass: serviceMock,
    };
    const wrapper = mount(<PractitionerForm {...props} />);

    // username, name is required, active is required but always has default value
    const errors = wrapper.find('small.text-danger');
    expect(errors.length).toEqual(0);

    wrapper.find('form').simulate('submit');
    wrapper.update();

    // should now have errors for username, name, and openmrs id
    let nameError = wrapper.find('small.name-error');
    expect(nameError.length).toEqual(1);

    let usernameError = wrapper.find('small.username');
    expect(usernameError.length).toEqual(1);

    let userId = wrapper.find('small.userId-error');
    expect(userId.length).toEqual(1);

    /** Now fill the form, submitting should not have the same errors
     * Also will check for correct data to api call
     */
    const practitionerInput = wrapper.find('#name');
    practitionerInput.simulate('change', { target: { value: 'jon Snow', name: 'name' } });

    // username for practitioner
    const usernameInput = wrapper.find('#username');
    usernameInput.simulate('change', { target: { value: 'bastar', name: 'username' } });
    expect(usernameInput.length).toEqual(1);

    // asyncs select to retrieve openmrs username
    const openmrsId = wrapper.find('#userId');

    // active
    const activeRadioYes = wrapper.find('input#yes');
    activeRadioYes.simulate('click');

    // checking input data
    wrapper.find('form').simulate('submit');
    wrapper.update();

    // should now have no errors for username, name, and openmrs id
    nameError = wrapper.find('small.name-error');
    expect(nameError.length).toEqual(0);

    usernameError = wrapper.find('small.username');
    expect(usernameError.length).toEqual(0);

    userId = wrapper.find('small.userId-error');
    expect(userId.length).toEqual(0);

    const expectedValues: PractitionerFormFields = {
      active: true,
      identifier: '',
      name: 'jon Snow',
      userId: '',
      username: 'bastar',
    };

    expect(updateMock.mock.calls).toEqual(expectedValues);
  });
});
