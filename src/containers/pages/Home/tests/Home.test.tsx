import { mount, shallow } from 'enzyme';
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
});
