import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import {
  faCog,
  faDownload,
  faExternalLinkSquareAlt,
  faHome,
  faMap,
  faSearch,
  faSlidersH,
  faTextHeight,
} from '@fortawesome/free-solid-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { AuthorizationGrantType, ConnectedOauthCallback, OauthLogin } from '@onaio/gatekeeper';
import { initGoogleAnalytics, RouteTracker, setDimensions } from '@onaio/google-analytics';
import { getUser } from '@onaio/session-reducer';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch } from 'react-router';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Col, Container, Row } from 'reactstrap';
import CustomConnectedAPICallBack from '../components/page/CustomCallback';
import Loading from '../components/page/Loading';
import {
  BACKEND_ACTIVE,
  DISABLE_LOGIN_PROTECTION,
  GA_CODE,
  GA_ENV,
  TOAST_AUTO_CLOSE_DELAY,
  WEBSITE_NAME,
} from '../configs/env';
import { LOGIN_PROMPT, RENEW_SESSION_LINK_TEXT, SESSION_EXPIRED_TEXT } from '../configs/lang';
import { providers } from '../configs/settings';

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '@onaio/drill-down-table/dist/table.css';
import { TokenExpired } from '@onaio/gatekeeper';
import { CustomLogout } from '../components/Logout';
import { Footer } from '../components/page/Footer';
import {
  ASSIGN_JURISDICTIONS_URL,
  ASSIGN_PLAN_URL,
  ASSIGN_PRACTITIONERS_URL,
  AUTO_ASSIGN_JURISDICTIONS_URL,
  BACKEND_CALLBACK_PATH,
  BACKEND_CALLBACK_URL,
  BACKEND_LOGIN_URL,
  CLIENTS_LIST_URL,
  CREATE_ORGANIZATION_URL,
  CREATE_PRACTITIONER_URL,
  EDIT_ORGANIZATION_URL,
  EDIT_PRACTITIONER_URL,
  EDIT_SERVER_SETTINGS_URL,
  FI_FILTER_URL,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  GA_ENV_TEST,
  HOME_URL,
  IRS_MOP_UP_REPORT_URL,
  JSON_VALIDATORS_URL,
  JURISDICTION_METADATA_URL,
  LOGOUT_URL,
  MANIFEST_FILE_UPLOAD,
  MANIFEST_RELEASE_URL,
  MANUAL_ASSIGN_JURISDICTIONS_URL,
  MAP,
  MDA_POINT_CHILD_REPORT_URL,
  MDA_POINT_LOCATION_REPORT_URL,
  NEW_PLAN_URL,
  NEW_PLANNING_PLAN_URL,
  ORGANIZATIONS_LIST_URL,
  PERFORMANCE_REPORT_IRS_PLAN_URL,
  PLAN_COMPLETION_URL,
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  PLANNING_VIEW_URL,
  PRACTITIONERS_LIST_URL,
  REACT_CALLBACK_PATH,
  REACT_LOGIN_URL,
  REPORT_IRS_LITE_PLAN_URL,
  REPORT_IRS_PLAN_URL,
  REPORT_MDA_LITE_CDD_REPORT_URL,
  REPORT_MDA_LITE_PLAN_URL,
  REPORT_MDA_LITE_WARD_URL,
  REPORT_MDA_PLAN_URL,
  REPORT_MDA_POINT_PLAN_URL,
  REPORT_SMC_PLAN_URL,
  SESSION_EXPIRED_URL,
  SINGLE_ORGANIZATION_URL,
  STRUCTURE_METADATA_URL,
  VIEW_DRAFT_FILES_URL,
} from '../constants';
import ConnectedHeader from '../containers/ConnectedHeader';
import { JSONValidatorListPage } from '../containers/pages/ConfigForm/JSONValidators';
import { ManifestDraftFilesPage } from '../containers/pages/ConfigForm/manifest/draftFiles';
import { ManifestFiles } from '../containers/pages/ConfigForm/manifest/filesList';
import { ManifestReleasesPage } from '../containers/pages/ConfigForm/manifest/releases';
import ConnectedUploadConfigFilePage from '../containers/pages/ConfigForm/manifest/uploadFile';
import ConnectedMDAJurisdictionReport from '../containers/pages/DynamicMDA/JurisdictionsReport';
import ConnectedMDAPLansList from '../containers/pages/DynamicMDA/plans';
import ActiveFocusInvestigation from '../containers/pages/FocusInvestigation/active';
import FIJurisdiction from '../containers/pages/FocusInvestigation/jurisdiction';
import SingleActiveFIMap from '../containers/pages/FocusInvestigation/map/active';
import ConnectedPlanCompletion from '../containers/pages/FocusInvestigation/map/planCompletion';
import Home from '../containers/pages/Home/Home';
import BaseNewPlan, {
  NewPlanForPlanning,
} from '../containers/pages/InterventionPlan/NewPlan/General';
import { PlanDefinitionList } from '../containers/pages/InterventionPlan/PlanDefinitionList';
import { DraftPlans } from '../containers/pages/InterventionPlan/PlanningView/DraftPlans';
import ConnectedUpdatePlan from '../containers/pages/InterventionPlan/UpdatePlan';
import { OpenSRPPlansList } from '../containers/pages/IRS/assignments';
import ConnectedJurisdictionReport from '../containers/pages/IRS/JurisdictionsReport';
import ConnectedIRSReportingMap from '../containers/pages/IRS/Map';
import { IRSMopUpReporting } from '../containers/pages/IRS/Mopup/plans';
import ConnectedMopup from '../containers/pages/IRS/Mopup/reports';
import { IRSPlanPerfomenceReport } from '../containers/pages/IRS/performanceReport/plans';
import ConnectedIRSPerfomenceReport from '../containers/pages/IRS/performanceReport/reports';
import ConnectedIRSPlansList from '../containers/pages/IRS/plans';
import ConnectedJurisdictionReportLite from '../containers/pages/IRSLite/JurisdictionsReportLite';
import ConnectedIRSLiteReportingMap from '../containers/pages/IRSLite/MapLite';
import ConnectedIRSLitePlansList from '../containers/pages/IRSLite/plans';
import ConnectedAutoSelectView from '../containers/pages/JurisdictionAssignment/AutoSelectJurisdictions';
import { ConnectedEntryView } from '../containers/pages/JurisdictionAssignment/EntryView';
import ConnectedJurisdictionAssignmentView from '../containers/pages/JurisdictionAssignment/ManualSelectJurisdiction';
import ConnectedMDALiteCddReports from '../containers/pages/MDALite/cddReports/cdds';
import ConnectedMDALiteSupervisorReports from '../containers/pages/MDALite/cddReports/supervisors';
import ConnectedMdaLiteJurisdictionReport from '../containers/pages/MDALite/jurisdictionsReport';
import ConnectedMDALiteMapReport from '../containers/pages/MDALite/map';
import ConnectedMDALitePlansList from '../containers/pages/MDALite/plans';
import ConnectedMDALiteWardsReport from '../containers/pages/MDALite/wardReports';
import ConnectedChildReports from '../containers/pages/MDAPoint/ChildReports';
import ConnectedClientListView from '../containers/pages/MDAPoint/ClientListView';
import ConnectedMdaPointJurisdictionReport from '../containers/pages/MDAPoint/jurisdictionsReport';
import ConnectedSchoolReports from '../containers/pages/MDAPoint/LocationReports';
import ConnectedMDAPointPlansList from '../containers/pages/MDAPoint/plans';
import ConnectedAssignPractitioner from '../containers/pages/OrganizationViews/AssignPractitioners';
import ConnectedCreateEditOrgView from '../containers/pages/OrganizationViews/CreateEditOrgView';
import ConnectedOrgsListView from '../containers/pages/OrganizationViews/OrganizationListView';
import ConnectedSingleOrgView from '../containers/pages/OrganizationViews/SingleOrganizationView';
import { ConnectedPlanAssignment } from '../containers/pages/PlanAssignment';
import ConnectedCreateEditPractitionerView from '../containers/pages/PractitionerViews/CreateEditPractitioner';
import ConnectedPractitionersListView from '../containers/pages/PractitionerViews/PractitionerListView';
import { EditServerSettings } from '../containers/pages/ServerSettings/EditSettings';
import JurisdictionMetadata from '../containers/pages/SettingsMetadata/JurisdictionMetadata';
import StructureMetadataImportView from '../containers/pages/SettingsMetadata/StructureMetadata';
import ConnectedSMCJurisdictionReport from '../containers/pages/SMC/jurisdictionsReport';
import ConnectedSMCReportingMap from '../containers/pages/SMC/Map';
import ConnectedSMCPlansList from '../containers/pages/SMC/plans';
import { oAuthUserInfoGetter } from '../helpers/utils';
import store from '../store';
import './App.css';

library.add(
  faDownload,
  faExternalLinkSquareAlt,
  faSearch,
  faSlidersH,
  faCog,
  faMap,
  faUser,
  faTextHeight,
  faHome,
  faTimes,
  faCheck
);

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

const APP_CALLBACK_URL = BACKEND_ACTIVE ? BACKEND_CALLBACK_URL : REACT_LOGIN_URL;
const { IMPLICIT, AUTHORIZATION_CODE } = AuthorizationGrantType;
const AuthGrantType = BACKEND_ACTIVE ? AUTHORIZATION_CODE : IMPLICIT;
const APP_LOGIN_URL = BACKEND_ACTIVE ? BACKEND_LOGIN_URL : REACT_LOGIN_URL;
const APP_CALLBACK_PATH = BACKEND_ACTIVE ? BACKEND_CALLBACK_PATH : REACT_CALLBACK_PATH;

/** Main App component */
const App = () => {
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
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${MDA_POINT_CHILD_REPORT_URL}/:planId/:jurisdictionId`}
                  component={ConnectedChildReports}
                />
                {/* SMC Reporting plan table view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_SMC_PLAN_URL}
                  component={ConnectedSMCPlansList}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_SMC_PLAN_URL}/:planId`}
                  component={ConnectedSMCJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_SMC_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedSMCJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_SMC_PLAN_URL}/:planId/:jurisdictionId/${MAP}`}
                  component={ConnectedSMCReportingMap}
                />
                {/* MDA Lite Reporting plan table view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_MDA_LITE_PLAN_URL}
                  component={ConnectedMDALitePlansList}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_LITE_PLAN_URL}/:planId`}
                  component={ConnectedMdaLiteJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_LITE_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedMdaLiteJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_LITE_PLAN_URL}/:planId/:jurisdictionId/${MAP}`}
                  component={ConnectedMDALiteMapReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_LITE_WARD_URL}/:planId/:jurisdictionId`}
                  component={ConnectedMDALiteWardsReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_LITE_CDD_REPORT_URL}/:planId/:jurisdictionId`}
                  component={ConnectedMDALiteSupervisorReports}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_LITE_CDD_REPORT_URL}/:planId/:jurisdictionId/:supervisorId`}
                  component={ConnectedMDALiteCddReports}
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
                {/* IRS Lite Reporting plan table view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_IRS_LITE_PLAN_URL}
                  component={ConnectedIRSLitePlansList}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_LITE_PLAN_URL}/:planId`}
                  component={ConnectedJurisdictionReportLite}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_LITE_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedJurisdictionReportLite}
                />
                {/* IRS Reporting Map view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_LITE_PLAN_URL}/:planId/:jurisdictionId/${MAP}`}
                  component={ConnectedIRSLiteReportingMap}
                />
                {/* IRS Reporting Map view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`}
                  component={ConnectedIRSReportingMap}
                />
                {/* IRS performance Reporting view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PERFORMANCE_REPORT_IRS_PLAN_URL}
                  component={IRSPlanPerfomenceReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId`}
                  component={ConnectedIRSPerfomenceReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedIRSPerfomenceReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/:dataCollector`}
                  component={ConnectedIRSPerfomenceReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/:dataCollector/:sop`}
                  component={ConnectedIRSPerfomenceReport}
                />
                {/* MDA Reporting plan table view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={REPORT_MDA_PLAN_URL}
                  component={ConnectedMDAPLansList}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_PLAN_URL}/:planId`}
                  component={ConnectedMDAJurisdictionReport}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${REPORT_MDA_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedMDAJurisdictionReport}
                />
                {/* Plan Assignment views for Plan */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}`}
                  component={OpenSRPPlansList}
                />
                {/* Plan assignment views for Plan & Jurisdictions */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}/:planId`}
                  component={ConnectedPlanAssignment}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_PLAN_URL}/:planId/:jurisdictionId`}
                  component={ConnectedPlanAssignment}
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
                  component={BaseNewPlan}
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
                  component={PlanDefinitionList}
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
                {/** form config views */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={MANIFEST_RELEASE_URL}
                  component={ManifestReleasesPage}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${MANIFEST_RELEASE_URL}/:id`}
                  component={ManifestFiles}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={JSON_VALIDATORS_URL}
                  component={JSONValidatorListPage}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${MANIFEST_FILE_UPLOAD}/:type`}
                  component={ConnectedUploadConfigFilePage}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${MANIFEST_FILE_UPLOAD}/:type/:id`}
                  component={ConnectedUploadConfigFilePage}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={VIEW_DRAFT_FILES_URL}
                  component={ManifestDraftFilesPage}
                />
                {/* Upload Jurisdiction Metadata view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={JURISDICTION_METADATA_URL}
                  component={JurisdictionMetadata}
                />
                {/* Upload Structure Metadata view */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={STRUCTURE_METADATA_URL}
                  component={StructureMetadataImportView}
                />
                {/* server settings - Editing population characteristics */}
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={EDIT_SERVER_SETTINGS_URL}
                  component={EditServerSettings}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={PLANNING_VIEW_URL}
                  component={DraftPlans}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={NEW_PLANNING_PLAN_URL}
                  component={NewPlanForPlanning}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
                  component={ConnectedJurisdictionAssignmentView}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId`}
                  component={ConnectedJurisdictionAssignmentView}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
                  component={ConnectedAutoSelectView}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId`}
                  component={ConnectedAutoSelectView}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${ASSIGN_JURISDICTIONS_URL}/:planId`}
                  component={ConnectedEntryView}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={IRS_MOP_UP_REPORT_URL}
                  component={IRSMopUpReporting}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${IRS_MOP_UP_REPORT_URL}/:planId`}
                  component={ConnectedMopup}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={`${IRS_MOP_UP_REPORT_URL}/:planId/:jurisdictionId`}
                  component={ConnectedMopup}
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
                    return <CustomLogout />;
                  }}
                />
                <ConnectedPrivateRoute
                  redirectPath={APP_CALLBACK_URL}
                  disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                  exact={true}
                  path={SESSION_EXPIRED_URL}
                  // tslint:disable-next-line: jsx-no-lambda
                  component={() => {
                    return (
                      <TokenExpired
                        logoutUrl={LOGOUT_URL}
                        logoutLinkText={RENEW_SESSION_LINK_TEXT}
                        sessionExpiryText={SESSION_EXPIRED_TEXT}
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
