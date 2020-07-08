import ListView from '@onaio/list-view';
import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { defaultWalkerProps, WithWalkerProps } from '../../../../../components/TreeWalker';
import {
  ASSIGN_PLANS,
  HOME,
  LOADING,
  NAME,
  NO_ROWS_FOUND,
  TEAMS_ASSIGNMENT,
} from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../../../constants';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import { Organization } from '../../../../../store/ducks/opensrp/organizations';
import { AssignedOrgs } from '../AssignedOrgs';
import { EditOrgs } from '../EditOrgs';
import { JurisdictionCell } from '../JurisdictionCell';

/** base props for JurisdictionTable */
interface BaseJurisdictionTablProps extends WithWalkerProps {
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
  const { assignments, organizations, plan, submitCallBackFunc } = props;

  const currentChildren = props.currentChildren as TreeNode[];
  const currentNode = props.currentNode as TreeNode;
  const hierarchy = props.hierarchy as TreeNode[];

  if (!plan) {
    return null;
  }

  const pageTitle = plan.title;
  const baseUrl = `${ASSIGN_PLAN_URL}/${plan.identifier}`;

  const breadcrumbProps = {
    currentPage: {
      label: currentNode ? LOADING : pageTitle,
      url: baseUrl,
    },
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

  if (currentNode) {
    breadcrumbProps.pages.push({
      label: pageTitle,
      url: baseUrl,
    });
  }

  for (let index = 0; index < hierarchy.length; index++) {
    const element = hierarchy[index];

    if (index < hierarchy.length - 1) {
      breadcrumbProps.pages.push({
        label: element.model.label,
        url: `${baseUrl}/${element.model.id}`,
      });
    } else {
      breadcrumbProps.currentPage = {
        label: element.model.label,
        url: `${baseUrl}/${element.model.id}`,
      };
    }
  }

  const data = currentChildren.map(node => {
    const jurisdictionAssignments = assignments.filter(
      assignment => assignment.jurisdiction === node.model.id
    );
    const jurisdictionOrgs = organizations.filter(org => {
      const jurisdictionOrgIds = jurisdictionAssignments.map(assignment => assignment.organization);
      return jurisdictionOrgIds.includes(org.identifier);
    });

    const orgOptions = organizations.map(org => {
      return { label: org.name, value: org.identifier };
    });

    const selectedOrgs = jurisdictionOrgs.map(org => {
      return { label: org.name, value: org.identifier };
    });

    return [
      <JurisdictionCell
        key={`${node.model.id}-jurisdiction`}
        node={node}
        url={`${ASSIGN_PLAN_URL}/${plan.identifier}/${node.id}`}
      />,
      <AssignedOrgs key={`${node.model.id}-txt`} id={node.model.id} orgs={jurisdictionOrgs} />,
      <EditOrgs
        defaultValue={selectedOrgs}
        jurisdiction={node}
        existingAssignments={jurisdictionAssignments}
        key={`${node.model.id}-form`}
        options={orgOptions}
        plan={plan}
        submitCallBackFunc={submitCallBackFunc}
      />,
    ];
  });
  const headerItems = [NAME, TEAMS_ASSIGNMENT, ''];
  const tableClass = 'table table-bordered';
  const renderHeaders = () => {
    return (
      <thead className="thead-plan-orgs">
        <tr>
          <th style={{ width: '25%' }}>{headerItems[0]}</th>
          <th style={{ width: '25%' }}>{headerItems[1]}</th>
          <th>{headerItems[2]}</th>
        </tr>
      </thead>
    );
  };

  const listViewProps = {
    data,
    headerItems,
    renderHeaders,
    tableClass,
  };

  return (
    <Fragment>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <ListView {...listViewProps} />
      {!data.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_ROWS_FOUND}
          <hr />
        </div>
      )}
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
