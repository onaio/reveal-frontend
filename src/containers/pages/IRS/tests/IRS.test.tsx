import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import IRS from '../IRS';

const history = createBrowserHistory();

describe('containers/pages/IRS', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <IRS />
      </Router>
    );
  });

  it('renders IRS correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <IRS />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
