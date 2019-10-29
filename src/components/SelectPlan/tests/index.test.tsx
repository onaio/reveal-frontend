import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import SelectComponent from '../';
import { PLAN_SELECT_PLACEHOLDER } from '../../../constants';
import * as fixtures from '../../../store/ducks/tests/fixtures';

const history = createBrowserHistory();

describe('components/page/Header', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      plansArray: [fixtures.plan1, fixtures.plan2],
    };
    shallow(
      <Router history={history}>
        <SelectComponent {...props} />
      </Router>
    );
  });

  it('renders header correctly', () => {
    const props = {
      plansArray: [fixtures.plan1, fixtures.plan2],
    };
    const wrapper = mount(
      <Router history={history}>
        <SelectComponent {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders header correctly when authenticated', () => {
    const props = {
      plansArray: [fixtures.plan1, fixtures.plan2],
    };
    const wrapper = mount(
      <Router history={history}>
        <SelectComponent {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders a placeholder correctly if provided', () => {
    const props = {
      placeholder: PLAN_SELECT_PLACEHOLDER,
      plansArray: [fixtures.plan1, fixtures.plan2],
    };
    const wrapper = mount(
      <Router history={history}>
        <SelectComponent {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
