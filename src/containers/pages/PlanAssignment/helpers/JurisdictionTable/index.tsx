import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { defaultWalkerProps, WithWalkerProps } from '../../../../../components/TreeWalker';
import { ASSIGN_PLANS, HOME } from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../../../constants';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import { Organization } from '../../../../../store/ducks/opensrp/organizations';

/** base props for JurisdictionTable */
export interface BaseJurisdictionTablProps extends WithWalkerProps {
  assignments: Assignment[];
  organizations: Organization[];
  plan: PlanDefinition | null;
  submitCallBackFunc: (assignments: Assignment[]) => void;
}

/** Route params interface */
export interface RouteParams {
  jurisdictionId: string;
  planId: string;
}

/** Props for JurisdictionTable */
export type JurisdictionTableProps = RouteComponentProps<RouteParams> & BaseJurisdictionTablProps;

/**
 * JurisdictionTable
 *
 * This component renders the table of jurisdictions on the plan assignment page.
 * The expectation is that to use this component, one will need to "enhance" it by
 * having it wrapped by the `withTreeWalker` higher order component.
 *
 * @param props - the props that JurisdictionTable expects
 */
const JurisdictionTable = (props: JurisdictionTableProps) => {
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

/** default props for JurisdictionTable */
const defaultProps: BaseJurisdictionTablProps = {
  ...defaultWalkerProps,
  assignments: [],
  organizations: [],
  plan: null,
  submitCallBackFunc: () => null,
};

JurisdictionTable.defaultProps = defaultProps;

export { JurisdictionTable };
