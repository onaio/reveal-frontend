import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HeaderComponent from '..';

const history = createBrowserHistory();

describe('components/page/Header', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      authenticated: false,
      user: {
        email: '',
        name: '',
        username: '',
      },
    };
    shallow(
      <Router history={history}>
        <HeaderComponent {...props} />
      </Router>
    );
  });

  it('renders header correctly', () => {
    const props = {
      authenticated: false,
      user: {
        email: '',
        name: '',
        username: '',
      },
    };
    const wrapper = mount(
      <Router history={history}>
        <HeaderComponent {...props} />
      </Router>
    );

    expect(toJson(wrapper.find('Navbar').find('Link.navbar-brand'))).toMatchSnapshot('reveal logo');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .find("a[href*='login']")
      )
    ).toMatchSnapshot('login link');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .find("a[href='/']")
      )
    ).toMatchSnapshot('home');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .find("a[href='/404']")
      )
    ).toMatchSnapshot('users and about');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .at(0)
          .find('DropdownToggle')
      )
    ).toMatchSnapshot('Dropdown');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .at(0)
          .find('DropdownToggle')
      )
    ).toMatchSnapshot('DropDownMenu');
    wrapper.unmount();
  });

  it('renders header correctly when authenticated', () => {
    const props = {
      authenticated: true,
      user: {
        email: 'bob@example.com',
        name: 'Bobbie',
        username: 'RobertBaratheon',
      },
    };
    const wrapper = mount(
      <Router history={history}>
        <HeaderComponent {...props} />
      </Router>
    );

    expect(toJson(wrapper.find('Navbar').find('Link.navbar-brand'))).toMatchSnapshot('reveal logo');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .find("a[href*='logout']")
      )
    ).toMatchSnapshot('logout link');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .find("a[href='/']")
      )
    ).toMatchSnapshot('home');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .find("a[href='/404']")
      )
    ).toMatchSnapshot('users and about');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .at(0)
          .find('DropdownToggle')
      )
    ).toMatchSnapshot('Dropdown');
    expect(
      toJson(
        wrapper
          .find('Collapse')
          .find('Transition')
          .find('Nav')
          .at(0)
          .find('DropdownToggle')
      )
    ).toMatchSnapshot('DropDownMenu');
    wrapper.unmount();
  });
});
