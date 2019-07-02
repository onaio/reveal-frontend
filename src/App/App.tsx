import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { ConnectedLogout, ConnectedOauthCallback, OauthLogin } from '@onaio/gatekeeper';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Col, Container, Row } from 'reactstrap';
import Loading from '../components/page/Loading';
import { DISABLE_LOGIN_PROTECTION } from '../configs/env';
import { providers } from '../configs/settings';
import {
  FI_HISTORICAL_URL,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  INTERVENTION_IRS_URL,
  LOGIN_URL,
  LOGOUT_URL,
} from '../constants';
import ConnectedHeader from '../containers/ConnectedHeader';
import ActiveFocusInvestigation from '../containers/pages/FocusInvestigation/active';
import HistoricalFocusInvestigation from '../containers/pages/FocusInvestigation/historical';
import SingleActiveFIMap from '../containers/pages/FocusInvestigation/map/active';
import SingleFI from '../containers/pages/FocusInvestigation/single';
import Home from '../containers/pages/Home/Home';
import IrsPlans from '../containers/pages/InterventionPlan/IRS';
import IrsDraftPlan from '../containers/pages/InterventionPlan/IRS/draft';
import IrsFinalizedPlan from '../containers/pages/InterventionPlan/IRS/finalized';
import IrsNewPlan from '../containers/pages/InterventionPlan/IRS/new';
import { oAuthUserInfoGetter } from '../helpers/utils';

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
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path="/"
                component={Home}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={INTERVENTION_IRS_URL}
                component={IrsPlans}
              />

              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${INTERVENTION_IRS_URL}/new`}
                component={IrsNewPlan}
              />

              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${INTERVENTION_IRS_URL}/draft`} // todo - add :id
                component={IrsDraftPlan}
              />

              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${INTERVENTION_IRS_URL}/plan`} // todo - add :id
                component={IrsFinalizedPlan}
              />

              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={FI_URL}
                component={ActiveFocusInvestigation}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${FI_SINGLE_URL}/:id`}
                component={SingleFI}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${FI_SINGLE_MAP_URL}/:id/`}
                component={SingleActiveFIMap}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${FI_SINGLE_MAP_URL}/:id/:goalId`}
                component={SingleActiveFIMap}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={FI_HISTORICAL_URL}
                component={HistoricalFocusInvestigation}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                    oAuthUserInfoGetter={oAuthUserInfoGetter}
                    {...routeProps}
                  />
                )}
              />
              {/* tslint:enable jsx-no-lambda */}
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={LOGOUT_URL}
                component={ConnectedLogout}
              />
            </Switch>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
