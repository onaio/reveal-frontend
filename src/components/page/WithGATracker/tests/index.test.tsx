import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { ConnectedRouter } from 'connected-react-router';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import WithGATracker, { getGAusername, setGAusername } from '..';
import App from '../../../../App/App';
import { DISABLE_LOGIN_PROTECTION } from '../../../../configs/env';
import Home from '../../../../containers/pages/Home/Home';
import store from '../../../../store';

const history = createBrowserHistory();

describe('components/WithGATracker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('gets and sets the username dimension', () => {
    expect(getGAusername()).toBe('');
    setGAusername({ username: 'Conor' });
    expect(getGAusername()).toBe('Conor');
  });

  it('renders components correctly when wrapped with HOC', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App>
            <ConnectedPrivateRoute
              disableLoginProtection={DISABLE_LOGIN_PROTECTION}
              exact={true}
              path="/"
              component={WithGATracker(Home)}
            />
          </App>
        </ConnectedRouter>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
