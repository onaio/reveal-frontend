import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import SelectComponent from '../';
import { PLAN_SELECT_PLACEHOLDER } from '../../../configs/lang';
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
    // tslint:disable-next-line:no-inferred-empty-object-type
    expect(wrapper.find('IndicatorsContainer').prop('options')).toMatchSnapshot(
      'Select Indicator Options'
    );
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
    expect(wrapper.find('Select').prop('placeholder')).toMatch(PLAN_SELECT_PLACEHOLDER);
    wrapper.unmount();
  });
});
