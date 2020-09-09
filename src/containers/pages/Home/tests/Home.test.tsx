import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Router } from 'react-router';
import { HOME_TITLE } from '../../../../configs/lang';
import Home from '../Home';

jest.mock('../../../../configs/env');

const history = createBrowserHistory();

describe('containers/pages/Home', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <Home />
      </Router>
    );
  });

  it('renders Home correctly & changes Title of page', () => {
    const wrapper = mount(
      <Router history={history}>
        <Home />
      </Router>
    );

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(HOME_TITLE);
    expect(wrapper.find('.welcome-box h3').text()).toEqual('Welcome to Reveal');
    expect(wrapper.find('.welcome-box p').text()).toEqual(
      'Get started by selecting an intervention below'
    );
    expect(wrapper.find('.col-md-6').length).toEqual(4);
    wrapper.find('.col-md-6').forEach((col, index) => {
      expect(col.find('button').text()).toMatchSnapshot(`box-${index + 1}-text`);
      expect(col.find('a').props().href).toMatchSnapshot(`box-${index + 1}-link`);
    });
    wrapper.unmount();
  });

  it('quick links configuration works correctly', () => {
    const envModule = require('../../../../configs/env');
    // turn off all quick links except teams
    envModule.ENABLE_HOME_MANAGE_PLANS_LINK = false;
    envModule.ENABLE_HOME_PLANNING_VIEW_LINK = false;
    envModule.ENABLE_FI = false;

    const wrapper = mount(
      <Router history={history}>
        <Home />
      </Router>
    );

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(HOME_TITLE);
    expect(wrapper.find('.welcome-box h3').text()).toEqual('Welcome to Reveal');
    expect(wrapper.find('.welcome-box p').text()).toEqual(
      'Get started by selecting an intervention below'
    );
    // all quick links are disabled
    expect(wrapper.find('.col-md-6').length).toEqual(1);
    expect(toJson(wrapper.find('.col-md-6'))).toMatchSnapshot('teams home link');
    wrapper.unmount();
  });
});
