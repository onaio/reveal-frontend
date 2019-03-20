import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Route, Router, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import HistoricalFocusInvestigation from '../../historical';

const history = createBrowserHistory();

describe('containers/pages/HistoricalFocusInvestigation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: 'Province 1' },
        path: '/focus-investigation/:id',
        url: '/focus-investigation/Province 1',
      },
    };
    shallow(
      <Router history={history}>
        <HistoricalFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders HistoricalFocusInvestigation correctly', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: '/focus-investigation/:id',
        url: '/focus-investigation/Province 1',
      },
    };
    const wrapper = mount(
      <Router history={history}>
        <HistoricalFocusInvestigation {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('drilling down HistoricalFocusInvestigation works correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <div>
          <Link to="/focus-investigation">Start</Link>
          <Switch>
            <Route
              exact={true}
              path="/focus-investigation"
              component={HistoricalFocusInvestigation}
            />
            <Route
              exact={true}
              path="/focus-investigation/:id"
              component={HistoricalFocusInvestigation}
            />
          </Switch>
        </div>
      </Router>
    );
    expect(wrapper.find('a[href$="focus-investigation"]').length).toEqual(1);
    wrapper
      .find('a[href$="focus-investigation"]')
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(2);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(1);
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find('.rt-td a[href$="focus-investigation/Province 1"]').length).toEqual(1);
    wrapper
      .find('a[href$="focus-investigation/Province 1"]')
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find('a[href$="focus-investigation/Province 1"]')
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(3);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(2);
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find('a[href$="focus-investigation/District 1"]').length).toEqual(1);
    wrapper
      .find('a[href$="focus-investigation/District 1"]')
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find('a[href$="focus-investigation/District 1"]')
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(4);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(3);
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find('a[href$="focus-investigation/Canton 1"]').length).toEqual(1);
    wrapper
      .find('a[href$="focus-investigation/Canton 1"]')
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find('a[href$="focus-investigation/Canton 1"]')
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(5);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(4);
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find('a[href$="focus-investigation/Village 1"]').length).toEqual(1);
    wrapper
      .find('a[href$="focus-investigation/Village 1"]')
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find('a[href$="focus-investigation/Village 1"]')
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(6);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(5);
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
