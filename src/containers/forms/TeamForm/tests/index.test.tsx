import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import snapshotDiff from 'snapshot-diff';
import Teamform from '..';
import TeamForm from '..';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('containers/forms/Teamform', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<Teamform />);
  });

  it('renders correctly', () => {
    // emphasizes on fields showing up
    const wrapper = mount(<Teamform />);

    // identifier field
    expect(toJson(wrapper.find('input#identifier'))).toMatchSnapshot('Team identifier');

    // team name field
    expect(toJson(wrapper.find('input#name'))).toMatchSnapshot('Team name');
  });

  it('renders fields correctly in edit mode', () => {
    const props = {
      initialValues: fixtures.organization1,
    };
    const createModeWrapper = mount(<TeamForm />);
    const editModewrapper = mount(<TeamForm {...props} />);

    // identifier field
    const createModeIdInput = createModeWrapper.find('input#identifier');
    const editModeIdInput = editModewrapper.find('input#identifier');
    expect(snapshotDiff(toJson(createModeIdInput), toJson(editModeIdInput))).toMatchSnapshot(
      'Id field should have value in edit mode'
    );

    // identifier field
    const createModeNameInput = createModeWrapper.find('input#name');
    const editModeNameInput = editModewrapper.find('input#name');
    expect(snapshotDiff(toJson(createModeNameInput), toJson(editModeNameInput))).toMatchSnapshot(
      'Should not be different'
    );
  });

  it('form validation works', async () => {
    const wrapper = mount(<TeamForm />);
    wrapper.find('form').simulate('submit');
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    expect(wrapper.find('small.name-error').text()).toEqual('Required');
  });
});
