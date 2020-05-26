import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import _ from 'lodash';
import React from 'react';
import { Router } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import { createChangeHandler, SearchForm } from '../../Search';

const actualDebounce = _.debounce;
const customDebounce = (callback: any) => callback;
_.debounce = customDebounce;

const history = createBrowserHistory();

jest.useFakeTimers();

describe('src/components/SearchForm', () => {
  afterAll(() => {
    _.debounce = actualDebounce;
  });

  it('renders without crashing', () => {
    shallow(<SearchForm />);
  });
  it('renders correctly', () => {
    const props = {
      placeholder: 'Random string',
    };
    const wrapper = mount(<SearchForm {...props} />);
    expect(wrapper.find('.search-input-wrapper').length).toEqual(1);
    expect(wrapper.find('FontAwesomeIcon').length).toEqual(1);
    wrapper.unmount();
  });

  it('handles submit correctly when provided changeHandler', () => {
    const onChangeHandlerMock = jest.fn();
    const props = {
      onChangeHandler: onChangeHandlerMock,
      placeholder: '',
    };
    const wrapper = mount(
      <Router history={history}>
        <SearchForm {...props} />
      </Router>
    );

    wrapper.find('input').simulate('input', { target: { value: 'test' } });

    expect(onChangeHandlerMock.mock.calls[0][0].target.value).toEqual('test');
    wrapper.unmount();
  });

  it('changeHandler Factory works', () => {
    // this test case exercises the createChangeHandler factory with is reveal-specific
    const queryParam = 'randomString';
    const locationProps: RouteComponentProps = {
      history,
      location: {
        hash: '',
        pathname: '/somewhere',
        search: '',
        state: '',
      },
      match: {
        isExact: true,
        params: {},
        path: '/somewhere',
        url: '/somehwere',
      },
    };
    const onChangeHandler = createChangeHandler(queryParam, locationProps);
    const props = {
      onChangeHandler,
      placeholder: '',
    };
    const wrapper = mount(
      <Router history={history}>
        <SearchForm {...props} />
      </Router>
    );

    wrapper.find('input').simulate('input', { target: { value: 'test' } });
    expect(history.location.search).toEqual('?randomString=test');

    wrapper.unmount();
  });
});
