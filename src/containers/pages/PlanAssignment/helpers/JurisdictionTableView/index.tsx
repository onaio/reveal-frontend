import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { defaultWalkerProps, WithWalkerProps } from '../../../../../components/TreeWalker';
import { ASSIGN_PLANS, HOME } from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../../../constants';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

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
 * This component renders the table of jurisdictions on the plan assignment page.
 * The expectation is that to use this component, one will need to "enhance" it by
 * having it wrapped by the `withTreeWalker` higher order component.
 *
 * @param props - the props that JurisdictionTableView expects
 */
const JurisdictionTableView = (props: JurisdictionTableViewProps) => {
  const { plan } = props;
  const hierarchy = props.hierarchy as TreeNode[];

  if (!plan) {
    return null;
  }

  const pageTitle = plan.title;
  const baseUrl = `${ASSIGN_PLAN_URL}/${plan.identifier}`;

  const initialCurrentPage = {
    label: pageTitle,
    url: baseUrl,
  };

  const breadcrumbProps = {
    currentPage: initialCurrentPage,
    isPlanAssignmentPage: true,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: ASSIGN_PLANS,
        url: ASSIGN_PLAN_URL,
      },
    ],
  };

  // create breadcrumb props.
  if (props.match.params.jurisdictionId) {
    const path = [...hierarchy];
    const lastNode = path.pop();

    breadcrumbProps.pages.push(initialCurrentPage);

    path.forEach(nd => {
      breadcrumbProps.pages.push({
        label: nd.model.label,
        url: `${baseUrl}/${nd.model.id}`,
      });
    });

    breadcrumbProps.currentPage = {
      label: (lastNode as TreeNode).model.label,
      url: `${baseUrl}/${(lastNode as TreeNode).model.id}`,
    };
  }

  return (
    <Fragment>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
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
