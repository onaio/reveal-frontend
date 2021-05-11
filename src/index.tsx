import { history } from '@onaio/connected-reducer-registry';
import * as Sentry from '@sentry/browser';
import * as SentryReact from '@sentry/react';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App/App';
import { Fallback } from './components/errors/Fallback';
import { SENTRY_DSN } from './configs/env';
import * as serviceWorker from './serviceWorker';
import store from './store';

import 'react-toastify/dist/ReactToastify.css';
// tslint:disable-next-line: ordered-imports
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/css/index.css';

import reducerRegistry from '@onaio/redux-reducer-registry';
import { addConfigs, configsReducer, configsSliceName, LanguageCode } from '@opensrp/pkg-config';
import { LANGUAGE } from './configs/env';

/** register reducer for configs */
reducerRegistry.register(configsSliceName, configsReducer);
const opensrpLanguageConfig = {
  languageCode: LANGUAGE as LanguageCode,
};
/** Dispatch language to use for opensrp packages */
store.dispatch(addConfigs(opensrpLanguageConfig));

if (SENTRY_DSN !== '') {
  Sentry.init({ dsn: SENTRY_DSN });
}

ReactDOM.render(
  <Provider store={store}>
    <SentryReact.ErrorBoundary fallback={Fallback}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </SentryReact.ErrorBoundary>
  </Provider>,
  document.getElementById('reveal-root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
