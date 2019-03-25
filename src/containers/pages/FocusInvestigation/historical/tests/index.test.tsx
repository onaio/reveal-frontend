import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Route, Router, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { FI_HISTORICAL_URL } from '../../../../../constants';
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
        path: `${FI_HISTORICAL_URL}/:id`,
        url: `${FI_HISTORICAL_URL}/Province 1`,
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
        path: `${FI_HISTORICAL_URL}/:id`,
        url: `${FI_HISTORICAL_URL}/Province 1`,
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
          <Link to={FI_HISTORICAL_URL}>Start</Link>
          <Switch>
            <Route
              exact={true}
              path={`${FI_HISTORICAL_URL}`}
              component={HistoricalFocusInvestigation}
            />
            <Route
              exact={true}
              path={`${FI_HISTORICAL_URL}/:id`}
              component={HistoricalFocusInvestigation}
            />
          </Switch>
        </div>
      </Router>
    );
    expect(wrapper.find(`a[href$="${FI_HISTORICAL_URL}"]`).length).toEqual(1);
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(2);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(1);
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot();
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find('table.definitions').length).toEqual(1);
    expect(toJson(wrapper.find('table.definitions'))).toMatchSnapshot();
    expect(wrapper.find('ResponseAdherence').length).toEqual(1);
    expect(toJson(wrapper.find('ResponseAdherence'))).toMatchSnapshot();
    expect(wrapper.find(`.rt-td a[href$="${FI_HISTORICAL_URL}/Province 1"]`).length).toEqual(1);
    // in the following, you'll notice that we are clicking twice
    // for some reason we had to do this to get it to move to the next component
    // SHOULD PROBABLY FIND A FIX FOR THIS
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/Province 1"]`)
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/Province 1"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(3);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(2);
    expect(wrapper.find('table.definitions').length).toEqual(1);
    expect(wrapper.find('ResponseAdherence').length).toEqual(1);
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot();
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find(`a[href$="${FI_HISTORICAL_URL}/District 1"]`).length).toEqual(1);
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/District 1"]`)
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/District 1"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(4);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(3);
    expect(wrapper.find('table.definitions').length).toEqual(1);
    expect(wrapper.find('ResponseAdherence').length).toEqual(1);
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot();
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find(`a[href$="${FI_HISTORICAL_URL}/Canton 1"]`).length).toEqual(1);
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/Canton 1"]`)
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/Canton 1"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(5);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(4);
    expect(wrapper.find('table.definitions').length).toEqual(1);
    expect(wrapper.find('ResponseAdherence').length).toEqual(1);
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot();
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    expect(wrapper.find(`a[href$="${FI_HISTORICAL_URL}/Village 1"]`).length).toEqual(1);
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/Village 1"]`)
      .first()
      .simulate('click', { button: 0 });
    wrapper
      .find(`a[href$="${FI_HISTORICAL_URL}/Village 1"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(6);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(5);
    expect(wrapper.find('table.definitions').length).toEqual(1);
    expect(wrapper.find('ResponseAdherence').length).toEqual(0);
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot();
    expect(toJson(wrapper.find('ReactTable'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
