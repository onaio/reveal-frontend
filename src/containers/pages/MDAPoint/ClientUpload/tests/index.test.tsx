import { cleanup } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ClientUpload from '..';
const history = createBrowserHistory();

describe('components/ClientUpload', () => {
  afterEach(cleanup);
  it('renders without crashing', () => {
    shallow(<ClientUpload />);
  });

  it('Matches snapshot', () => {
    const wrapper = mount(
      <Router history={history}>
        <ClientUpload />
      </Router>
    );
    expect(toJson(wrapper.find('ClientUpload'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
