import { history } from '@onaio/connected-reducer-registry';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App/App';
import Logout from './components/Logout';
import * as serviceWorker from './serviceWorker';
import store from './store';

import 'react-toastify/dist/ReactToastify.css';
// tslint:disable-next-line: ordered-imports
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/css/index.css';

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App logoutComponent={Logout} />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('reveal-root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
