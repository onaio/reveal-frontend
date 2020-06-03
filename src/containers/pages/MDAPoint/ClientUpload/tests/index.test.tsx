import { cleanup } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ClientUpload, { defaultProps } from '..';
const history = createBrowserHistory();

describe('components/ClientUpload', () => {
  afterEach(cleanup);
  it('renders without crashing', () => {
    shallow(<ClientUpload />);
  });

  it('renders props correctly', () => {
    const props = {
      ...defaultProps,
    };
    const wrapper = mount(
      <Router history={history}>
        <ClientUpload {...props} />
      </Router>
    );
    expect(wrapper.children().props()).toMatchSnapshot('ClientUpload Select Props ownProps');
    wrapper.unmount();
  });
});
