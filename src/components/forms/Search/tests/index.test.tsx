import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import _ from 'lodash';
import React from 'react';
import { Router } from 'react-router';
import SearchForm from '../../Search';

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
    shallow(
      <Router history={history}>
        <SearchForm />
      </Router>
    );
  });
  it('renders correctly', () => {
    const props = {
      placeholder: 'Random string',
      queryParam: 'RandomStringToo',
    };
    const wrapper = mount(
      <Router history={history}>
        <SearchForm {...props} />
      </Router>
    );
    expect(wrapper.find('.search-input-wrapper').length).toEqual(1);
    expect(wrapper.find('FontAwesomeIcon').length).toEqual(1);
    wrapper.unmount();
  });

  it('handles submit correctly when provided changeHandler', () => {
    const onChangeHandlerMock = jest.fn();
    const props = {
      onChangeHandler: onChangeHandlerMock,
      placeholder: '',
      queryParam: 'randomString',
    };
    const wrapper = mount(
      <Router history={history}>
        <SearchForm {...props} />
      </Router>
    );

    wrapper.find('Input').simulate('input', { target: { value: 'test' } });

    expect(onChangeHandlerMock.mock.calls[0][0].target.value).toEqual('test');
    expect(history.location.search).toEqual('');

    wrapper.unmount();
  });

  it('default onChange handler works with routes', () => {
    const props = {
      placeholder: '',
      queryParam: 'randomString',
    };
    const wrapper = mount(
      <Router history={history}>
        <SearchForm {...props} />
      </Router>
    );

    wrapper.find('Input').simulate('input', { target: { value: 'test' } });
    expect(history.location.search).toEqual('?randomString=test');

    wrapper.unmount();
  });

  it('behaviour when onChange event has no input', () => {
    const props = {
      placeholder: '',
      queryParam: 'randomString',
    };
    const wrapper = mount(
      <Router history={history}>
        <SearchForm {...props} />
      </Router>
    );

    wrapper.find('Input').simulate('input', { target: { value: '' } });
    expect(history.location.search).toEqual('');

    wrapper.unmount();
  });
});
