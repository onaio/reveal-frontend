import reducerRegistry from '@onaio/redux-reducer-registry';
import {
  ConnectedEditSetings,
  locationReducerName,
  locationsReducer,
  settingsReducer,
  settingsReducerName,
} from '@opensrp/population-characteristics';
import '@opensrp/population-characteristics/dist/styles/index.css';
import React from 'react';
import Helmet from 'react-helmet';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { OPENSRP_API_BASE_URL, OPENSRP_API_V2_BASE_URL } from '../../../../configs/env';
import {
  DESCRIPTION_LABEL,
  EDIT_LABEL,
  HOME,
  INHERIT_SETTING_LABEL,
  INHERITED_FROM_LABEL,
  NAME,
  NO_DATA_FOUND,
  PAGE_TITLE_LABEL,
  SEARCH_SETTINGS_LABEL,
  SERVER_SETTINGS,
  SET_TO_NO_LABEL,
  SET_TO_YES_LABEL,
  SETTINGS_LABEL,
} from '../../../../configs/lang';
import {
  HOME_URL,
  LOCATIONS_ENDPOINT,
  SECURITY_AUTHENTICATE_ENDPOINT,
  SETTINGS_ENDPOINT,
} from '../../../../constants';
import { growl } from '../../../../helpers/utils';
import { getPayloadOptions } from '../../../../services/opensrp';
import './index.css';

/** register the reducers */
reducerRegistry.register(settingsReducerName, settingsReducer);
reducerRegistry.register(locationReducerName, locationsReducer);

export const EditServerSettings = () => {
  const breadcrumbProps = {
    currentPage: {
      label: SERVER_SETTINGS,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  const baseURL = OPENSRP_API_BASE_URL.replace('rest/', '');

  const labels = {
    descriptionLabel: DESCRIPTION_LABEL,
    editLabel: EDIT_LABEL,
    inheritSettingsLabel: INHERIT_SETTING_LABEL,
    inheritedLable: INHERITED_FROM_LABEL,
    nameLabel: NAME,
    noDataFound: NO_DATA_FOUND,
    pageTitle: PAGE_TITLE_LABEL,
    placeholder: SEARCH_SETTINGS_LABEL,
    setToNoLabel: SET_TO_NO_LABEL,
    setToYesLabel: SET_TO_YES_LABEL,
    settingLabel: SETTINGS_LABEL,
  };

  const settingsProps = {
    LoadingComponent: <Loading />,
    baseURL,
    customAlert: growl,
    getPayload: getPayloadOptions,
    labels,
    locationsEndpoint: LOCATIONS_ENDPOINT,
    restBaseURL: OPENSRP_API_BASE_URL,
    secAuthEndpoint: SECURITY_AUTHENTICATE_ENDPOINT,
    settingsEndpoint: SETTINGS_ENDPOINT,
    v2BaseUrl: OPENSRP_API_V2_BASE_URL,
  };

  return (
    <div>
      <Helmet>
        <title>{SERVER_SETTINGS}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <ConnectedEditSetings {...settingsProps} />
    </div>
  );
};
