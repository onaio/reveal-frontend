import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { LinkList } from '../../../../../components/page/HeaderBreadcrumb/helpers';
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
 * This component renders the breadcrumb and plan title of jurisdictions on the plan assignment page.
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

  let currentPage = initialCurrentPage;
  const pages = [
    {
      label: HOME,
      url: HOME_URL,
    },
    {
      label: ASSIGN_PLANS,
      url: ASSIGN_PLAN_URL,
    },
  ];

  // create breadcrumb props.
  if (props.match.params.jurisdictionId) {
    const path = [...hierarchy];
    const lastNode = path.pop();

    pages.push(initialCurrentPage);

    path.forEach(nd => {
      pages.push({
        label: nd.model.label,
        url: `${baseUrl}/${nd.model.id}`,
      });
    });

    currentPage = {
      label: (lastNode as TreeNode).model.label,
      url: `${baseUrl}/${(lastNode as TreeNode).model.id}`,
    };
  }

  return (
    <Fragment>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <div>
        <Breadcrumb className="reveal-breadcrumb plans-breadcrumb">
          <LinkList pages={pages} />
          <BreadcrumbItem active={true}>{currentPage.label}</BreadcrumbItem>
        </Breadcrumb>
      </div>
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
