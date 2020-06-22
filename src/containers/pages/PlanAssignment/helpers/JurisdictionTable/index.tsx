import ListView from '@onaio/list-view';
import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { defaultWalkerProps, WithWalkerProps } from '../../../../../components/TreeWalker';
import { ASSIGN_PLANS, HOME, NO_ROWS_FOUND } from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../../../constants';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';
import { Organization } from '../../../../../store/ducks/opensrp/organizations';
import { AssignedOrgs } from '../AssignedOrgs';
import { EditOrg } from '../EditOrg';
import { JurisdictionCell } from '../JurisdictionCell';

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

export type JurisdictionTableProps = RouteComponentProps<RouteParams> & BaseJurisdictionTablProps;

const JurisdictionTable = (props: JurisdictionTableProps) => {
  const {
    assignments,
    currentChildren,
    currentNode,
    hierarchy,
    limits,
    organizations,
    plan,
    submitCallBackFunc,
  } = props;

  if (!plan) {
    return null;
  }

  const pageTitle = plan.title;
  const baseUrl = `${ASSIGN_PLAN_URL}/${plan.identifier}`;

  const breadcrumbProps = {
    currentPage: {
      label: currentNode ? 'loading...' : pageTitle,
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
        label: element.properties.name,
        url: `${baseUrl}/${element.id}`,
      });
    } else {
      breadcrumbProps.currentPage = {
        label: element.properties.name,
        url: `${baseUrl}/${element.id}`,
      };
    }
  }

  const data = currentChildren.map(node => {
    const jurisdictionAssignments = assignments.filter(
      assignment => assignment.jurisdiction === node.id
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
      <JurisdictionCell key={`${node.id}-jurisdiction`} node={node} plan={plan} limits={limits} />,
      <AssignedOrgs key={`${node.id}-txt`} id={node.id} orgs={jurisdictionOrgs} />,
      <EditOrg
        defaultValue={selectedOrgs}
        jurisdiction={node}
        key={`${node.id}-form`}
        options={orgOptions}
        plan={plan}
        submitCallBackFunc={submitCallBackFunc}
      />,
    ];
  });
  const headerItems = ['Name', 'Team Assignment', ''];
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

const defaultProps: BaseJurisdictionTablProps = {
  ...defaultWalkerProps,
  assignments: [],
  organizations: [],
  plan: null,
  submitCallBackFunc: () => null,
};

JurisdictionTable.defaultProps = defaultProps;

export { JurisdictionTable };
