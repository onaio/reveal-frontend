import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faExternalLinkSquareAlt, faMap } from '@fortawesome/free-solid-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { ConnectedLogout, ConnectedOauthCallback, OauthLogin } from '@onaio/gatekeeper';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch } from 'react-router';
import { Col, Container, Row } from 'reactstrap';
import Loading from '../components/page/Loading';
import { WEBSITE_NAME } from '../configs/env';
import { DISABLE_LOGIN_PROTECTION } from '../configs/env';
import { providers } from '../configs/settings';
import {
  CREATE_TEAM_URL,
  EDIT_TEAM_URL,
  FI_HISTORICAL_URL,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  INTERVENTION_IRS_URL,
  LOGIN_URL,
  LOGOUT_URL,
  NEW_IRS_PLAN_URL,
  NEW_PLAN_URL,
  PLAN_COMPLETION_URL,
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  SINGLE_TEAM_URL,
  TEAM_LIST_URL,
} from '../constants';
import ConnectedHeader from '../containers/ConnectedHeader';
import ActiveFocusInvestigation from '../containers/pages/FocusInvestigation/active';
import HistoricalFocusInvestigation from '../containers/pages/FocusInvestigation/historical';
import SingleActiveFIMap from '../containers/pages/FocusInvestigation/map/active';
import ConnectedPlanCompletion from '../containers/pages/FocusInvestigation/map/planCompletion';
import SingleFI from '../containers/pages/FocusInvestigation/single';
import Home from '../containers/pages/Home/Home';
import IrsPlans from '../containers/pages/InterventionPlan/IRS';
import IrsPlan from '../containers/pages/InterventionPlan/IRS/plan';
import NewPlan from '../containers/pages/InterventionPlan/NewPlan/General';
import NewIRSPlan from '../containers/pages/InterventionPlan/NewPlan/IRS';
import ConnectedPlanDefinitionList from '../containers/pages/InterventionPlan/PlanDefinitionList';
import ConnectedUpdatePlan from '../containers/pages/InterventionPlan/UpdatePlan';
import ConnectedCreateEditTeamView from '../containers/pages/TeamAssignment/CreateEditTeamView';
import ConnectedSingleTeamView from '../containers/pages/TeamAssignment/SingleTeamView';
import { TeamListView } from '../containers/pages/TeamAssignment/TeamListView';
import { oAuthUserInfoGetter } from '../helpers/utils';

library.add(faMap);
library.add(faUser);
library.add(faExternalLinkSquareAlt);

import './App.css';

/** Main App component */
class App extends Component {
  public render() {
    return (
      <Container>
        <Helmet titleTemplate={`%s | ` + WEBSITE_NAME} defaultTitle="" />
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
                path={NEW_IRS_PLAN_URL}
                component={NewIRSPlan}
              />

              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${INTERVENTION_IRS_URL}/draft/:id`}
                component={IrsPlan}
              />

              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${INTERVENTION_IRS_URL}/plan/:id`}
                component={IrsPlan}
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
                path={`${PLAN_COMPLETION_URL}/:id`}
                component={ConnectedPlanCompletion}
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
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={NEW_PLAN_URL}
                component={NewPlan}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${PLAN_UPDATE_URL}/:id`}
                component={ConnectedUpdatePlan}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={PLAN_LIST_URL}
                component={ConnectedPlanDefinitionList}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={!DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={CREATE_TEAM_URL}
                component={ConnectedCreateEditTeamView}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={!DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${EDIT_TEAM_URL}/:id`}
                component={ConnectedCreateEditTeamView}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={`${SINGLE_TEAM_URL}/:id`}
                component={ConnectedSingleTeamView}
              />
              <ConnectedPrivateRoute
                disableLoginProtection={!DISABLE_LOGIN_PROTECTION}
                exact={true}
                path={TEAM_LIST_URL}
                component={TeamListView}
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
