import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router';
import * as fixtures from '../../../../../../../../store/ducks/tests/fixtures';
import MarkCompleteLink from './../../MarkCompleteLink';

const history = createBrowserHistory();

describe('containers/pages/FocusInvestigation/active/map/helpers/MarkCompleteLink', () => {
  it('renders null if plan status is not active', () => {
    const props = {
      plan: fixtures.draftPlan,
    };
    const wrapper = mount(
      <Router history={history}>
        <MarkCompleteLink {...props} />
      </Router>
    );
    expect(wrapper.isEmptyRender()).toBe(true);
    wrapper.unmount();
  });

  it('renders a mark complete link if plan is active', () => {
    const props = {
      plan: fixtures.plan1,
    };
    const wrapper = mount(
      <Router history={history}>
        <MarkCompleteLink {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
