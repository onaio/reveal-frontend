import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { defaultWalkerProps, WithWalkerProps } from '../../../../../components/TreeWalker';
import { PlanDefinition } from '../../../../../configs/settings';
import { pagesBuilder } from './helpers/utils';

/** base props for JurisdictionTableView */
export interface BaseJurisdictionTablProps extends WithWalkerProps {
  plan: PlanDefinition | null;
}

/** Route params interface */
export interface RouteParams {
  jurisdictionId: string;
  planId: string;
}

/** Props for JurisdictionTableView */
export type JurisdictionTableViewProps = RouteComponentProps<RouteParams> &
  BaseJurisdictionTablProps;

/**
 * JurisdictionTableView
 *
 * This component renders the breadcrumb and plan title of jurisdictions on the plan assignment page.
 * The expectation is that to use this component, one will need to "enhance" it by
 * having it wrapped by the `withTreeWalker` higher order component.
 *
 * @param props - the props that JurisdictionTableView expects
 */
const JurisdictionTableView = (props: JurisdictionTableViewProps) => {
  const { plan } = props;

  if (!plan) {
    return null;
  }

  const breadCrumbProps = pagesBuilder(props);

  return (
    <Fragment>
      <Helmet>
        <title>{plan.title}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadCrumbProps} />
      <h3 className="mb-3 page-title">{plan.title}</h3>
    </Fragment>
  );
};

/** default props for JurisdictionTableView */
const defaultProps: BaseJurisdictionTablProps = {
  ...defaultWalkerProps,
  plan: null,
};

JurisdictionTableView.defaultProps = defaultProps;

export { JurisdictionTableView };
