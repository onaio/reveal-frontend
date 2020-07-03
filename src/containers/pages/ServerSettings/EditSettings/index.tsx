import React from 'react';
import Loading from '../../../../components/page/Loading';
import { OPENSRP_API_BASE_URL } from '../../../../configs/env';
import {
  DESCRIPTION_LABEL,
  EDIT_LABEL,
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
  LOCATIONS_ENDPOINT,
  SECURITY_AUTHENTICATE_ENDPOINT,
  SETTINGS_ENDPOINT,
} from '../../../../constants';
import { growl } from '../../../../helpers/utils';
import { getPayloadOptions } from '../../../../services/opensrp';

export const EditServerSettings = () => {
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
  };

  return <div>{SERVER_SETTINGS}</div>;
};
