import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import LinkAsButton from '..';

const history = createBrowserHistory();

describe('components/LinkToNewPlans', () => {
  it('renders without crashing', () => {
    shallow(<LinkAsButton />);
  });

  it('Matches snapshot', () => {
    const wrapper = mount(
      <Router history={history}>
        <LinkAsButton />
      </Router>
    );
    expect(wrapper.find('Router').length).toEqual(1);
    expect(toJson(wrapper.find('LinkAsButton'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
