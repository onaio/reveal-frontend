import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HeaderBreadcrumb from '../HeaderBreadcrumb';

const history = createBrowserHistory();

describe('components/page/HeaderBreadcrumb', () => {
  const fetchUpdatedCurrentParentHandlerMock = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      currentPage: {
        label: 'IRS',
        url: '/irs',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    };
    shallow(
      <Router history={history}>
        <HeaderBreadcrumb {...props} />
      </Router>
    );
  });

  it('renders HeaderBreadcrumb correctly', () => {
    const props = {
      currentPage: {
        label: 'IRS',
        url: '/irs',
      },
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
        <HeaderBreadcrumb {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
  it('dispatches fetchUpdatedCurrentParent action on click', () => {
    const props = {
      currentPage: {
        label: 'IRS',
        url: '/irs',
      },
      fetchUpdatedCurrentParentHandler: fetchUpdatedCurrentParentHandlerMock,
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
        <HeaderBreadcrumb {...props} />
      </Router>
    );
    wrapper
      .find('Link')
      .at(1)
      .simulate('click');
    expect(fetchUpdatedCurrentParentHandlerMock).toBeCalled();
    expect(fetchUpdatedCurrentParentHandlerMock).toBeCalledTimes(1);
    wrapper.unmount();
  });
  it('doesnt dispatch fetchUpdatedCurrentParent action on click if handler is undefined', () => {
    const props = {
      currentPage: {
        label: 'IRS',
        url: '/irs',
      },
      fetchUpdatedCurrentParentHandler: undefined,
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
        <HeaderBreadcrumb {...props} />
      </Router>
    );
    wrapper
      .find('Link')
      .at(1)
      .simulate('click');
    expect(fetchUpdatedCurrentParentHandlerMock).toBeCalledTimes(0);
    wrapper.unmount();
  });
});
