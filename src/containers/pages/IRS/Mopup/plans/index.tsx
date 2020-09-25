import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { MOP_UP_REPORTING_TITLE } from '../../../../../configs/lang';
import { IRS_MOP_UP_REPORT_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';
import ConnectedIRSPlansList from '../../plans';

export const IRSMopUpReporting = (props: RouteComponentProps<RouteParams>) => {
  const plansProps = {
    ...props,
    pageTitle: MOP_UP_REPORTING_TITLE,
    pageUrl: IRS_MOP_UP_REPORT_URL,
  };
  return <ConnectedIRSPlansList {...plansProps} />;
};
