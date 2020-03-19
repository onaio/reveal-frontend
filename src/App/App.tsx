import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faExternalLinkSquareAlt, faMap } from '@fortawesome/free-solid-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { ConnectedLogout, ConnectedOauthCallback, OauthLogin } from '@onaio/gatekeeper';
import { initGoogleAnalytics, RouteTracker, setDimensions } from '@onaio/google-analytics';
import { getUser } from '@onaio/session-reducer';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch } from 'react-router';
import { toast } from 'react-toastify';
import { Col, Container, Row } from 'reactstrap';
import Loading from '../components/page/Loading';
import { GA_CODE, GA_ENV, TOAST_AUTO_CLOSE_DELAY, WEBSITE_NAME } from '../configs/env';
import { DISABLE_LOGIN_PROTECTION, OPENSRP_LOGOUT_URL, OPENSRP_OAUTH_STATE } from '../configs/env';
import { providers } from '../configs/settings';

import {
  ACTIVE_IRS_PLAN_URL,
  ASSIGN_PLAN_URL,
  ASSIGN_PRACTITIONERS_URL,
  CREATE_ORGANIZATION_URL,
  CREATE_PRACTITIONER_URL,
  DRAFT_IRS_PLAN_URL,
  EDIT_ORGANIZATION_URL,
  EDIT_PRACTITIONER_URL,
  FI_FILTER_URL,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  GA_ENV_TEST,
  INTERVENTION_IRS_DRAFTS_URL,
  INTERVENTION_IRS_URL,
  LOGIN_URL,
  LOGOUT_URL,
  MAP,
  NEW_IRS_PLAN_URL,
  NEW_PLAN_URL,
  ORGANIZATIONS_LIST_URL,
  PLAN_COMPLETION_URL,
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  PRACTITIONERS_LIST_URL,
  REPORT_IRS_PLAN_URL,
  SINGLE_ORGANIZATION_URL,
} from '../constants';
import ConnectedHeader from '../containers/ConnectedHeader';
import ActiveFocusInvestigation from '../containers/pages/FocusInvestigation/active';
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
import ConnectedIRSAssignmentPlansList from '../containers/pages/IRS/assignments';
import ConnectedJurisdictionReport from '../containers/pages/IRS/JurisdictionsReport';
import ConnectedIRSReportingMap from '../containers/pages/IRS/Map';
import ConnectedIRSPlansList from '../containers/pages/IRS/plans';
import ConnectedAssignPractitioner from '../containers/pages/OrganizationViews/AssignPractitioners';
import ConnectedCreateEditOrgView from '../containers/pages/OrganizationViews/CreateEditOrgView';
import ConnectedOrgsListView from '../containers/pages/OrganizationViews/OrganizationListView';
import ConnectedSingleOrgView from '../containers/pages/OrganizationViews/SingleOrganizationView';
import ConnectedCreateEditPractitionerView from '../containers/pages/PractitionerViews/CreateEditPractitioner';
import ConnectedPractitionersListView from '../containers/pages/PractitionerViews/PractitionerListView';
import { oAuthUserInfoGetter } from '../helpers/utils';

library.add(faMap);
library.add(faUser);
library.add(faExternalLinkSquareAlt);
toast.configure({
  autoClose: TOAST_AUTO_CLOSE_DELAY /** defines how long a toast remains visible on screen */,
});

const initializeOptions = {
  testMode: GA_ENV_TEST === GA_ENV,
};

/** Initialize google analytics */
initGoogleAnalytics(GA_CODE, initializeOptions);

import store from '../store';
import { getOauthProviderState } from '../store/selectors';
import './App.css';

export interface AppProps {
  foo?: string; // Will remove this dummy
}

/** Interface defining component state */
export interface AppState {
  username: string;
}

/** Main App component */
class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      username: (getUser(store.getState()) || {}).username || '',
    };
  }

  public componentDidUpdate(_: AppProps, prevState: AppState) {
    const username = (getUser(store.getState()) || {}).username || '';

    if (prevState.username !== username) {
      this.setState({
        username,
      });
    }
  }

  public render() {
    const { username } = this.state;
    const dimensions = {
      env: GA_ENV,
      username,
    };
    setDimensions(dimensions);

    return (
      <Container fluid={true}>
        <Helmet titleTemplate={`%s | ` + WEBSITE_NAME} defaultTitle="" />
        <ConnectedHeader />
        <Container fluid={true}>
          <Row id="main-page-row">
            <Col>
              {<RouteTracker />}
              <Switch>
                {/* Home Page view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path="/"
                  component={Home}
                />
                {/* Active IRS Plans list view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={INTERVENTION_IRS_URL}
                  ConnectedOrgTeamView={true}
                  component={IrsPlans}
                />
                {/* Draft IRS Plans list view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={INTERVENTION_IRS_DRAFTS_URL}
                  component={IrsPlans}
                />
                {/* New IRS Plan form view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={NEW_IRS_PLAN_URL}
                  component={NewIRSPlan}
                />
                {/* Draft IRS Plan Jurisdiction Selection view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${DRAFT_IRS_PLAN_URL}/:id`}
                  component={IrsPlan}
                />
                {/* Draft IRS Plan Team Assignment view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ACTIVE_IRS_PLAN_URL}/:id`}
                  component={IrsPlan}
                />
                {/* IRS Reporting plan table view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_IRS_PLAN_URL}
                  component={ConnectedIRSPlansList}
                />
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId`}
                  component={ConnectedJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedJurisdictionReport}
                />
                {/* IRS Reporting Map view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`}
                  component={ConnectedIRSReportingMap}
                />
                {/* IRS Assignment views */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}`}
                  component={ConnectedIRSAssignmentPlansList}
                />
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}/:id`}
                  component={IrsPlan}
                />
                {/* Focus Investigation Reporting list view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={FI_URL}
                  component={ActiveFocusInvestigation}
                />
                {/* Focus Area detail view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_FILTER_URL}/:jurisdiction_parent_id/:plan_id?`}
                  component={ActiveFocusInvestigation}
                />
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_URL}/:id`}
                  component={SingleFI}
                />
                {/* Focus Investigation completion confirmation view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PLAN_COMPLETION_URL}/:id`}
                  component={ConnectedPlanCompletion}
                />
                {/* Focus Investigation Reporting map view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_MAP_URL}/:id/`}
                  component={SingleActiveFIMap}
                />
                {/* Focus Investigation Reporting map view (with goal layers) */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_MAP_URL}/:id/:goalId`}
                  component={SingleActiveFIMap}
                />
                {/* New Focus Investigation Plan form view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={NEW_PLAN_URL}
                  component={NewPlan}
                />
                {/* Edit Focus Investigation Plan form view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PLAN_UPDATE_URL}/:id`}
                  component={ConnectedUpdatePlan}
                />
                {/* Manage Plans list view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PLAN_LIST_URL}
                  component={ConnectedPlanDefinitionList}
                />
                {/** Organization list view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={ORGANIZATIONS_LIST_URL}
                  component={ConnectedOrgsListView}
                />
                {/** organization create view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={CREATE_ORGANIZATION_URL}
                  component={ConnectedCreateEditOrgView}
                />
                {/** Organization edit view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${EDIT_ORGANIZATION_URL}/:id`}
                  component={ConnectedCreateEditOrgView}
                />
                {/* single organization view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${SINGLE_ORGANIZATION_URL}/:id`}
                  component={ConnectedSingleOrgView}
                />
                {/* single organization view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${SINGLE_ORGANIZATION_URL}/:id`}
                  component={ConnectedSingleOrgView}
                />
                {/* Practitioner listing page */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PRACTITIONERS_LIST_URL}
                  component={ConnectedPractitionersListView}
                />
                {/** practitioner create view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={CREATE_PRACTITIONER_URL}
                  component={ConnectedCreateEditPractitionerView}
                />
                {/** Practitioner edit view */}
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${EDIT_PRACTITIONER_URL}/:id`}
                  component={ConnectedCreateEditPractitionerView}
                />
                {/** Assign practitioners to organization view */}
                />
                <ConnectedPrivateRoute
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PRACTITIONERS_URL}/:id`}
                  component={ConnectedAssignPractitioner}
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
                  // tslint:disable-next-line: jsx-no-lambda
                  component={() => {
                    const state = getOauthProviderState(store.getState());
                    return (
                      <ConnectedLogout
                        {...{
                          logoutURL: state === OPENSRP_OAUTH_STATE ? OPENSRP_LOGOUT_URL : null,
                        }}
                      />
                    );
                  }}
                />
              </Switch>
            </Col>
          </Row>
        </Container>
      </Container>
    );
  }
}

export default App;
