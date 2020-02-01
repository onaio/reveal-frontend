import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faExternalLinkSquareAlt, faMap } from '@fortawesome/free-solid-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import {
  AuthorizationGrantType,
  ConnectedAPICallback,
  ConnectedLogout,
  OauthLogin,
} from '@onaio/gatekeeper';
import querystring from 'querystring';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, withRouter } from 'react-router';
import { toast } from 'react-toastify';
import { Col, Container, Row } from 'reactstrap';
import Loading from '../components/page/Loading';
import WithGATracker from '../components/page/WithGATracker';
import { OAUTH_GET_STATE_URL, TOAST_AUTO_CLOSE_DELAY, WEBSITE_NAME } from '../configs/env';
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
  HOME_URL,
  INTERVENTION_IRS_DRAFTS_URL,
  INTERVENTION_IRS_URL,
  LOGIN_URL,
  LOGOUT_URL,
  MAP,
  NEW_IRS_PLAN_URL,
  NEW_PLAN_URL,
  OAUTH_CALLBACK_PATH,
  OAUTH_CALLBACK_URL,
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

library.add(faMap);
library.add(faUser);
library.add(faExternalLinkSquareAlt);
toast.configure({
  autoClose: TOAST_AUTO_CLOSE_DELAY /** defines how long a toast remains visible on screen */,
});

import { trimStart } from 'lodash';
import { Redirect, RouteProps } from 'react-router-dom';
import store from '../store';
import { getOauthProviderState } from '../store/selectors';
import './App.css';

/** Main App component */
class App extends Component {
  public render() {
    return (
      <Container fluid={true}>
        <Helmet titleTemplate={`%s | ` + WEBSITE_NAME} defaultTitle="" />
        <ConnectedHeader />
        <Container fluid={true}>
          <Row id="main-page-row">
            <Col>
              <Switch>
                {/* Home Page view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path="/"
                  component={WithGATracker(Home)}
                />
                {/* Active IRS Plans list view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={INTERVENTION_IRS_URL}
                  ConnectedOrgTeamView={true}
                  component={WithGATracker(IrsPlans)}
                />
                {/* Draft IRS Plans list view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={INTERVENTION_IRS_DRAFTS_URL}
                  component={WithGATracker(IrsPlans)}
                />
                {/* New IRS Plan form view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={NEW_IRS_PLAN_URL}
                  component={WithGATracker(NewIRSPlan)}
                />
                {/* Draft IRS Plan Jurisdiction Selection view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${DRAFT_IRS_PLAN_URL}/:id`}
                  component={WithGATracker(IrsPlan)}
                />
                {/* Draft IRS Plan Team Assignment view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ACTIVE_IRS_PLAN_URL}/:id`}
                  component={WithGATracker(IrsPlan)}
                />
                {/* IRS Reporting plan table view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_IRS_PLAN_URL}
                  component={WithGATracker(ConnectedIRSPlansList)}
                />
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId`}
                  component={WithGATracker(ConnectedJurisdictionReport)}
                />
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId`}
                  component={WithGATracker(ConnectedJurisdictionReport)}
                />
                {/* IRS Reporting Map view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`}
                  component={WithGATracker(ConnectedIRSReportingMap)}
                />
                {/* IRS Assignment views */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}`}
                  component={WithGATracker(ConnectedIRSAssignmentPlansList)}
                />
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}/:id`}
                  component={WithGATracker(IrsPlan)}
                />
                {/* Focus Investigation Reporting list view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={FI_URL}
                  component={WithGATracker(ActiveFocusInvestigation)}
                />
                {/* Focus Area detail view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_FILTER_URL}/:jurisdiction_parent_id/:plan_id?`}
                  component={WithGATracker(ActiveFocusInvestigation)}
                />
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_URL}/:id`}
                  component={WithGATracker(SingleFI)}
                />
                {/* Focus Investigation completion confirmation view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PLAN_COMPLETION_URL}/:id`}
                  component={WithGATracker(ConnectedPlanCompletion)}
                />
                {/* Focus Investigation Reporting map view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_MAP_URL}/:id/`}
                  component={WithGATracker(SingleActiveFIMap)}
                />
                {/* Focus Investigation Reporting map view (with goal layers) */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_MAP_URL}/:id/:goalId`}
                  component={WithGATracker(SingleActiveFIMap)}
                />
                {/* New Focus Investigation Plan form view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={NEW_PLAN_URL}
                  component={WithGATracker(NewPlan)}
                />
                {/* Edit Focus Investigation Plan form view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PLAN_UPDATE_URL}/:id`}
                  component={WithGATracker(ConnectedUpdatePlan)}
                />
                {/* Manage Plans list view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PLAN_LIST_URL}
                  component={WithGATracker(ConnectedPlanDefinitionList)}
                />
                {/** Organization list view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={ORGANIZATIONS_LIST_URL}
                  component={WithGATracker(ConnectedOrgsListView)}
                />
                {/** organization create view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={CREATE_ORGANIZATION_URL}
                  component={WithGATracker(ConnectedCreateEditOrgView)}
                />
                {/** Organization edit view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${EDIT_ORGANIZATION_URL}/:id`}
                  component={WithGATracker(ConnectedCreateEditOrgView)}
                />
                {/* single organization view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${SINGLE_ORGANIZATION_URL}/:id`}
                  component={WithGATracker(ConnectedSingleOrgView)}
                />
                {/* single organization view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${SINGLE_ORGANIZATION_URL}/:id`}
                  component={WithGATracker(ConnectedSingleOrgView)}
                />
                {/* Practitioner listing page */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PRACTITIONERS_LIST_URL}
                  component={WithGATracker(ConnectedPractitionersListView)}
                />
                {/** practitioner create view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={CREATE_PRACTITIONER_URL}
                  component={WithGATracker(ConnectedCreateEditPractitionerView)}
                />
                {/** Practitioner edit view */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${EDIT_PRACTITIONER_URL}/:id`}
                  component={WithGATracker(ConnectedCreateEditPractitionerView)}
                />
                {/** Assign practitioners to organization view */}
                />
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PRACTITIONERS_URL}/:id`}
                  component={WithGATracker(ConnectedAssignPractitioner)}
                />
                {/* tslint:disable jsx-no-lambda */}
                <Route
                  exact={true}
                  path={LOGIN_URL}
                  render={routeProps => (
                    <OauthLogin
                      providers={providers}
                      authorizationGrantType={AuthorizationGrantType.AUTHORIZATION_CODE}
                      {...routeProps}
                    />
                  )}
                />
                <Route
                  exact={true}
                  path={OAUTH_CALLBACK_PATH}
                  render={routeProps => (
                    <ConnectedAPICallback
                      LoadingComponent={Loading}
                      UnSuccessfulLoginComponent={() => {
                        return <Redirect to={LOGIN_URL} />;
                      }}
                      SuccessfulLoginComponent={withRouter(props => {
                        let pathToRedirectTo = HOME_URL;
                        const searchString = trimStart(props.location.search, '?');
                        const searchParams = querystring.parse(searchString);
                        const nextPath = searchParams.next as string | undefined;
                        if (nextPath) {
                          pathToRedirectTo = nextPath;
                        }
                        return <Redirect to={pathToRedirectTo} />;
                      })}
                      apiURL={OAUTH_GET_STATE_URL}
                      {...routeProps}
                    />
                  )}
                />
                {/* tslint:enable jsx-no-lambda */}
                <ConnectedPrivateRoute
                  redirectPath={OAUTH_CALLBACK_URL}
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
