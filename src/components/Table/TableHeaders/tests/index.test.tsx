import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import TableHeader from '..';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

const history = createBrowserHistory();

describe('components/page/Header', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders without crashing', () => {
    const props = {
      plansArray: [fixtures.plan1],
    };
    shallow(
      <Router history={history}>
        <TableHeader {...props} />
      </Router>
    );
  });

  it('renders reactive headers correctly', () => {
    const props = {
      plansArray: [fixtures.plan2],
    };
    const wrapper = mount(
      <Router history={history}>
        <TableHeader {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders routine headers correctly', () => {
    const props = {
      plansArray: [fixtures.plan1],
    };
    const wrapper = mount(
      <Router history={history}>
        <TableHeader {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
