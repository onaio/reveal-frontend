import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { LinkList } from '..';

const history = createBrowserHistory();

describe('components/page/HeaderBreadcrumb/helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    };
    shallow(
      <Router history={history}>
        <LinkList {...props} />
      </Router>
    );
  });

  it('renders LinkList correctly', () => {
    const props = {
      pages: [
        {
          label: 'Home',
          url: '/',
        },
        {
          label: 'Programs',
          url: '/programs',
        },
        {
          label: 'Provinces',
          url: '',
        },
        {
          label: 'Disctricts',
        },
      ],
    };
    const wrapper = mount(
      <Router history={history}>
        <LinkList {...props} />
      </Router>
    );
    expect(toJson(wrapper.find('LinkList'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
