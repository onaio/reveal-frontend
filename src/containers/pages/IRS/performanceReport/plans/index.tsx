import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IRS_PERFORMANCE_REPORTING_TITLE } from '../../../../../configs/lang';
import { PERFORMANCE_REPORT_IRS_PLAN_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';
import ConnectedIRSPlansList from '../../plans';

export const IRSPlanPerfomenceReport = (props: RouteComponentProps<RouteParams>) => {
  const plansProps = {
    ...props,
    pageTitle: IRS_PERFORMANCE_REPORTING_TITLE,
    pageUrl: PERFORMANCE_REPORT_IRS_PLAN_URL,
  };
  return <ConnectedIRSPlansList {...plansProps} />;
};
