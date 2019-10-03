import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import PractitionerForm, { PractitionerFormFields } from '..';

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

    // username for practitioner
    const usernameInput = wrapper.find('input#username');
    expect(usernameInput.length).toEqual(1);
    expect(toJson(usernameInput)).toMatchSnapshot('username input');

    // asyncs select to retrieve openmrs username
    const openmrsId = wrapper.find('#userIdSelect');
    expect(openmrsId.length).toBeGreaterThanOrEqual(1);
    expect(toJson(openmrsId)).toMatchSnapshot('openmrs userId select');

    // active
    const activeRadioNo = wrapper.find('input#no');
    expect(activeRadioNo.length).toEqual(1);
    expect(toJson(activeRadioNo)).toMatchSnapshot('active field no radio');

    const activeRadioYes = wrapper.find('input#yes');
    expect(activeRadioYes.length).toEqual(1);
    expect(toJson(activeRadioYes)).toMatchSnapshot('active field yes radio');
  });

  xit('validates correctly against yup schema', async () => {
    // check that errors arise when invalid data is passed in
    const serviceMock: any = jest.fn();

    const props = {
      serviceClass: serviceMock,
    };
    const wrapper = mount(<PractitionerForm {...props} />);

    // username, name is required, raises errors
    const errors = wrapper.find('small.text-danger');
    expect(errors.length).toEqual(0);

    wrapper.find('form').simulate('submit');
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    // should now have errors for username, name, and openmrs id
    // let nameError = wrapper.find('small.name-error');
    // expect(nameError.length).toEqual(1);

    // let usernameError = wrapper.find('small.username-error');
    // expect(usernameError.length).toEqual(1);

    // let userId = wrapper.find('small.userId-error');
    // expect(userId.length).toEqual(1);

    const practitionerInput = wrapper.find('input#name');
    practitionerInput.simulate('change', { target: { value: 'jon Snow', name: 'name' } });

    // username for practitioner
    const usernameInput = wrapper.find('input#username');
    usernameInput.simulate('change', { target: { value: 'bastar', name: 'username' } });
    expect(usernameInput.length).toEqual(1);

    // TODO - simulate value picking from active userId
    // asyncs select to retrieve openmrs username
    const openmrsId = wrapper.find('#userId');

    // active
    const activeRadioYes = wrapper.find('input#yes');
    activeRadioYes.simulate('click');

    // checking input data
    wrapper.find('form').simulate('submit');
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot('After editing');

    // should now have no errors for username, name, and openmrs id
    const nameError = wrapper.find('small.name-error');
    expect(nameError.length).toEqual(0);

    const usernameError = wrapper.find('small.username');
    expect(usernameError.length).toEqual(0);

    const userId = wrapper.find('small.userId-error');
    expect(userId.length).toEqual(0);
  });

  xit('Submits correct data on create', () => {
    // check that errors arise when invalid data is passed in
    const serviceMock: any = jest.fn();
    const updateMock: any = jest.fn();

    const props = {
      serviceClass: serviceMock,
    };
    const wrapper = mount(<PractitionerForm {...props} />);

    const practitionerInput = wrapper.find('#name');
    practitionerInput.simulate('change', { target: { value: 'jon Snow', name: 'name' } });

    // username for practitioner
    const usernameInput = wrapper.find('#username');
    usernameInput.simulate('change', { target: { value: 'bastar', name: 'username' } });
    expect(usernameInput.length).toEqual(1);

    // asyncs select to retrieve openmrs username // TODO - simulating change to this
    const openmrsId = wrapper.find('#userId');

    // active
    const activeRadioYes = wrapper.find('input#yes');
    activeRadioYes.simulate('click');

    // checking input data
    wrapper.find('form').simulate('submit');
    wrapper.update();

    // should now have no errors for username, name, and openmrs id
    const nameError = wrapper.find('small.name-error');
    expect(nameError.length).toEqual(0);

    const usernameError = wrapper.find('small.username');
    expect(usernameError.length).toEqual(0);

    const userId = wrapper.find('small.userId-error');
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
