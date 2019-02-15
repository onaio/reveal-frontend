import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import Header from '../Header';

const history = createBrowserHistory();

describe('components/page/Header', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <Header />
      </Router>
    );
  });

  it('renders header correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <Header />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
