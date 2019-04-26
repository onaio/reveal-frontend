import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { ConnectedOauthCallback, OauthLogin } from '@onaio/gatekeeper';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Col, Container, Row } from 'reactstrap';
import Loading from '../components/page/Loading';
import { providers } from '../configs/auth';
import {
  FI_HISTORICAL_URL,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  IRS_URL,
  LOGIN_URL,
  LOGOUT_URL,
} from '../constants';
import ConnectedHeader from '../containers/ConnectedHeader';
import ConnectedLogout from '../containers/Logout';
import ActiveFocusInvestigation from '../containers/pages/FocusInvestigation/active';
import HistoricalFocusInvestigation from '../containers/pages/FocusInvestigation/historical';
import SingleActiveFIMap from '../containers/pages/FocusInvestigation/map/active';
import SingleFI from '../containers/pages/FocusInvestigation/single';
import Home from '../containers/pages/Home/Home';
import IRS from '../containers/pages/IRS/IRS';
import ConnectedPrivateRoute from '../helpers/ConnectedPrivateRoute';

library.add(faMap);
library.add(faUser);

import './App.css';

/** Main App component */
class App extends Component {
  public render() {
    return (
      <Container>
        <ConnectedHeader />
        <Row id="main-page-row">
          <Col>
            <Switch>
              <ConnectedPrivateRoute exact={true} path="/" component={Home} />
              <ConnectedPrivateRoute exact={true} path={IRS_URL} component={IRS} />
              <ConnectedPrivateRoute
                exact={true}
                path={FI_URL}
                component={ActiveFocusInvestigation}
              />
              <ConnectedPrivateRoute
                exact={true}
                path={`${FI_SINGLE_URL}/:id`}
                component={SingleFI}
              />
              <ConnectedPrivateRoute
                exact={true}
                path={`${FI_SINGLE_MAP_URL}/:id`}
                component={SingleActiveFIMap}
              />
              <ConnectedPrivateRoute
                exact={true}
                path={FI_HISTORICAL_URL}
                component={HistoricalFocusInvestigation}
              />
              <ConnectedPrivateRoute
                exact={true}
                path={`${FI_HISTORICAL_URL}/:id`}
                component={HistoricalFocusInvestigation}
              />
              {/* tslint:disable jsx-no-lambda */}
              <Route
                exact={true}
                path={LOGIN_URL}
                render={routeProps => <OauthLogin providers={providers} {...routeProps} />}
              />
              <Route
                exact={true}
                path="/oauth/callback/:id"
                render={routeProps => (
                  <ConnectedOauthCallback
                    LoadingComponent={Loading}
                    providers={providers}
                    {...routeProps}
                  />
                )}
              />
              {/* tslint:enable jsx-no-lambda */}
              <ConnectedPrivateRoute exact={true} path={LOGOUT_URL} component={ConnectedLogout} />
            </Switch>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
