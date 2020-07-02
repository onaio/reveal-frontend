import React from 'react';
import Loading from '../../../components/page/Loading';
import { NoDataComponent } from '../../../components/Table/NoDataComponent';
import { OPENSRP_API_BASE_URL } from '../../../configs/env';
import { growl } from '../../../helpers/utils';
import { getPayloadOptions } from '../../../services/opensrp';

/** drill down props */
export const drillDownProps = {
  paginate: false,
  renderNullDataComponent: () => <NoDataComponent />,
};

export const defaultConfigProps = {
  LoadingComponent: <Loading />,
  baseURL: OPENSRP_API_BASE_URL,
  customAlert: growl,
  getPayload: getPayloadOptions,
};
