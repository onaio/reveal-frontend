import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import {
  faCog,
  faExternalLinkSquareAlt,
  faMap,
  faSearch,
  faSlidersH,
  faTextHeight,
} from '@fortawesome/free-solid-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import {
  AuthorizationGrantType,
  ConnectedLogout,
  ConnectedOauthCallback,
  OauthLogin,
} from '@onaio/gatekeeper';
import { initGoogleAnalytics, RouteTracker, setDimensions } from '@onaio/google-analytics';
import { getUser } from '@onaio/session-reducer';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch } from 'react-router';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Col, Container, Row } from 'reactstrap';
import { LogoutProps } from '../components/Logout';
import CustomConnectedAPICallBack from '../components/page/CustomCallback';
import Loading from '../components/page/Loading';
import {
  BACKEND_ACTIVE,
  DISABLE_LOGIN_PROTECTION,
  GA_CODE,
  GA_ENV,
  OPENSRP_LOGOUT_URL,
  OPENSRP_OAUTH_STATE,
  TOAST_AUTO_CLOSE_DELAY,
  WEBSITE_NAME,
} from '../configs/env';
import { LOGIN_PROMPT } from '../configs/lang';
import { providers } from '../configs/settings';

import '@onaio/drill-down-table/dist/table.css';
import { Footer } from '../components/page/Footer';
import {
  ACTIVE_IRS_PLAN_URL,
  ASSIGN_PLAN_URL,
  ASSIGN_PRACTITIONERS_URL,
  BACKEND_CALLBACK_PATH,
  BACKEND_CALLBACK_URL,
  BACKEND_LOGIN_URL,
  CLIENTS_LIST_URL,
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
  HOME_URL,
  INTERVENTION_IRS_DRAFTS_URL,
  LOGOUT_URL,
  MAP,
  MDA_POINT_LOCATION_REPORT_URL,
  NEW_IRS_PLAN_URL,
  NEW_PLAN_URL,
  ORGANIZATIONS_LIST_URL,
  PLAN_COMPLETION_URL,
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  PRACTITIONERS_LIST_URL,
  REACT_CALLBACK_PATH,
  REACT_LOGIN_URL,
  REPORT_IRS_PLAN_URL,
  REPORT_MDA_POINT_PLAN_URL,
  SINGLE_ORGANIZATION_URL,
  UPLOAD_JURISDICTION_METADATA_URL,
} from '../constants';
import ConnectedHeader from '../containers/ConnectedHeader';
import ActiveFocusInvestigation from '../containers/pages/FocusInvestigation/active';
import FIJurisdiction from '../containers/pages/FocusInvestigation/jurisdiction';
import SingleActiveFIMap from '../containers/pages/FocusInvestigation/map/active';
import ConnectedPlanCompletion from '../containers/pages/FocusInvestigation/map/planCompletion';
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
import JurisdictionMetadata from '../containers/pages/JurisdictionMetadata';
import ConnectedClientListView from '../containers/pages/MDAPoint/ClientListView';
import ConnectedMdaPointJurisdictionReport from '../containers/pages/MDAPoint/jurisdictionsReport';
import ConnectedSchoolReports from '../containers/pages/MDAPoint/LocationReports';
import ConnectedMDAPointPlansList from '../containers/pages/MDAPoint/plans';
import ConnectedAssignPractitioner from '../containers/pages/OrganizationViews/AssignPractitioners';
import ConnectedCreateEditOrgView from '../containers/pages/OrganizationViews/CreateEditOrgView';
import ConnectedOrgsListView from '../containers/pages/OrganizationViews/OrganizationListView';
import ConnectedSingleOrgView from '../containers/pages/OrganizationViews/SingleOrganizationView';
import ConnectedCreateEditPractitionerView from '../containers/pages/PractitionerViews/CreateEditPractitioner';
import ConnectedPractitionersListView from '../containers/pages/PractitionerViews/PractitionerListView';
import { oAuthUserInfoGetter } from '../helpers/utils';
import store from '../store';
import { getOauthProviderState } from '../store/selectors';
import './App.css';

library.add(faExternalLinkSquareAlt, faSearch, faSlidersH, faCog, faMap, faUser, faTextHeight);

toast.configure({
  autoClose: TOAST_AUTO_CLOSE_DELAY /** defines how long a toast remains visible on screen */,
});

/** Initialize google analytics */
if (GA_CODE) {
  const initiGoogleAnalyticsOptions = {
    testMode: GA_ENV_TEST === GA_ENV,
  };
  initGoogleAnalytics(GA_CODE, initiGoogleAnalyticsOptions);
}

/** Interface defining component state */
export interface AppState {
  username?: string;
}
/** Interface defining component props */
interface AppProps {
  logoutComponent: (props: LogoutProps) => null;
}

const APP_CALLBACK_URL = BACKEND_ACTIVE ? BACKEND_CALLBACK_URL : REACT_LOGIN_URL;
const { IMPLICIT, AUTHORIZATION_CODE } = AuthorizationGrantType;
const AuthGrantType = BACKEND_ACTIVE ? AUTHORIZATION_CODE : IMPLICIT;
const APP_LOGIN_URL = BACKEND_ACTIVE ? BACKEND_LOGIN_URL : REACT_LOGIN_URL;
const APP_CALLBACK_PATH = BACKEND_ACTIVE ? BACKEND_CALLBACK_PATH : REACT_CALLBACK_PATH;

/** Main App component */
const App = (props: AppProps) => {
  useEffect(() => {
    const username = (getUser(store.getState()) || {}).username || '';
    if (GA_CODE && username) {
      const dimensions = {
        env: GA_ENV,
        username,
      };
      setDimensions(dimensions);
    }
  }, [getUser(store.getState()).username]);
  return (
    <Container
      fluid={true}
      style={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <Helmet titleTemplate={`%s | ` + WEBSITE_NAME} defaultTitle="" />
      <div className="header-body">
        <ConnectedHeader />
        <Container fluid={true}>
          <Row id="main-page-row">
            <Col>
              {GA_CODE && <RouteTracker />}
              <Switch>
                {/* Home Page view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path="/"
                  component={Home}
                />
                {/* Draft IRS Plans list view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={INTERVENTION_IRS_DRAFTS_URL}
                  component={IrsPlans}
                />
                {/* New IRS Plan form view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={NEW_IRS_PLAN_URL}
                  component={NewIRSPlan}
                />
                {/* Draft IRS Plan Jurisdiction Selection view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${DRAFT_IRS_PLAN_URL}/:id`}
                  component={IrsPlan}
                />
                {/* Draft IRS Plan Team Assignment view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ACTIVE_IRS_PLAN_URL}/:id`}
                  component={IrsPlan}
                />
                {/* MDA point Reporting plan table view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_MDA_POINT_PLAN_URL}
                  component={ConnectedMDAPointPlansList}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_POINT_PLAN_URL}/:planId`}
                  component={ConnectedMdaPointJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_POINT_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedMdaPointJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${MDA_POINT_LOCATION_REPORT_URL}/:planId/:jurisdictionId`}
                  component={ConnectedSchoolReports}
                />
                {/* IRS Reporting plan table view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_IRS_PLAN_URL}
                  component={ConnectedIRSPlansList}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId`}
                  component={ConnectedJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedJurisdictionReport}
                />
                {/* IRS Reporting Map view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`}
                  component={ConnectedIRSReportingMap}
                />
                {/* IRS Assignment views */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}`}
                  component={ConnectedIRSAssignmentPlansList}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}/:id`}
                  component={IrsPlan}
                />
                {/* Focus Investigation Reporting list view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={FI_URL}
                  component={ActiveFocusInvestigation}
                />
                {/* Focus Area detail view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_URL}/:jurisdictionId`}
                  component={FIJurisdiction}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_FILTER_URL}/:jurisdiction_parent_id/:plan_id?`}
                  component={ActiveFocusInvestigation}
                />
                {/* Focus Investigation completion confirmation view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PLAN_COMPLETION_URL}/:id`}
                  component={ConnectedPlanCompletion}
                />
                {/* Focus Investigation Reporting map view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_MAP_URL}/:id/`}
                  component={SingleActiveFIMap}
                />
                {/* Focus Investigation Reporting map view (with goal layers) */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${FI_SINGLE_MAP_URL}/:id/:goalId`}
                  component={SingleActiveFIMap}
                />
                {/* New Focus Investigation Plan form view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={NEW_PLAN_URL}
                  component={NewPlan}
                />
                {/* Edit Focus Investigation Plan form view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PLAN_UPDATE_URL}/:id`}
                  component={ConnectedUpdatePlan}
                />
                {/* Manage Plans list view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PLAN_LIST_URL}
                  component={ConnectedPlanDefinitionList}
                />
                {/** Organization list view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={ORGANIZATIONS_LIST_URL}
                  component={ConnectedOrgsListView}
                />
                {/** organization create view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={CREATE_ORGANIZATION_URL}
                  component={ConnectedCreateEditOrgView}
                />
                {/** Organization edit view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${EDIT_ORGANIZATION_URL}/:id`}
                  component={ConnectedCreateEditOrgView}
                />
                {/* single organization view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${SINGLE_ORGANIZATION_URL}/:id`}
                  component={ConnectedSingleOrgView}
                />
                {/* Student listing page */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={false}
                  path={CLIENTS_LIST_URL}
                  component={ConnectedClientListView}
                />
                {/* single organization view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${SINGLE_ORGANIZATION_URL}/:id`}
                  component={ConnectedSingleOrgView}
                />
                {/* Practitioner listing page */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PRACTITIONERS_LIST_URL}
                  component={ConnectedPractitionersListView}
                />
                {/** practitioner create view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={CREATE_PRACTITIONER_URL}
                  component={ConnectedCreateEditPractitionerView}
                />
                {/** Practitioner edit view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${EDIT_PRACTITIONER_URL}/:id`}
                  component={ConnectedCreateEditPractitionerView}
                />
                {/** Assign practitioners to organization view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PRACTITIONERS_URL}/:id`}
                  component={ConnectedAssignPractitioner}
                />
                {/* Upload Jurisdiction Metadata view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={UPLOAD_JURISDICTION_METADATA_URL}
                  component={JurisdictionMetadata}
                />
                {/* tslint:disable jsx-no-lambda */}
                <Route
                  exact={true}
                  path={APP_LOGIN_URL}
                  render={routeProps => (
                    <OauthLogin
                      providers={providers}
                      authorizationGrantType={AuthGrantType}
                      OAuthLoginPromptMessage={LOGIN_PROMPT}
                      {...routeProps}
                    />
                  )}
                />
                <Route
                  exact={true}
                  path={APP_CALLBACK_PATH}
                  render={routeProps => {
                    if (BACKEND_ACTIVE) {
                      return <CustomConnectedAPICallBack {...routeProps} />;
                    }
                    return (
                      <ConnectedOauthCallback
                        SuccessfulLoginComponent={() => {
                          return <Redirect to={HOME_URL} />;
                        }}
                        LoadingComponent={Loading}
                        providers={providers}
                        oAuthUserInfoGetter={oAuthUserInfoGetter}
                        {...routeProps}
                      />
                    );
                  }}
                />
                {/* tslint:enable jsx-no-lambda */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={LOGOUT_URL}
                  // tslint:disable-next-line: jsx-no-lambda
                  component={() => {
                    if (BACKEND_ACTIVE) {
                      /** returns logout component responsible for opensrp logout and moving execution to express server */
                      return <props.logoutComponent logoutURL={OPENSRP_LOGOUT_URL} />;
                    }
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
      </div>
      <Container fluid={true} className="footer-row-container">
        <Row>
          <Col>
            <Footer />
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default App;
