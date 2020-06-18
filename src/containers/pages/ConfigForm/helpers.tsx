import React from 'react';
import Loading from '../../../components/page/Loading';
import { OPENSRP_API_BASE_URL } from '../../../configs/env';
import { growl } from '../../../helpers/utils';
import { getPayloadOptions } from '../../../services/opensrp';

export const defaultConfigProps = {
  LoadingComponent: <Loading />,
  baseURL: OPENSRP_API_BASE_URL,
  getPayload: getPayloadOptions,
  growl,
};
