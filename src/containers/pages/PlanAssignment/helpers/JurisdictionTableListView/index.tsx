import ListView from '@onaio/list-view';
import * as React from 'react';
import { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { LinkList } from '../../../../../components/page/HeaderBreadcrumb/helpers';
import { defaultWalkerProps, WithWalkerProps } from '../../../../../components/TreeWalker';
import { NAME, NO_ROWS_FOUND, TEAMS_ASSIGNMENT } from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { ASSIGN_PLAN_URL } from '../../../../../constants';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import { Organization } from '../../../../../store/ducks/opensrp/organizations';
import { AssignedOrgs } from '../AssignedOrgs';
import { EditOrgs } from '../EditOrgs';
import { JurisdictionCell } from '../JurisdictionCell';
import { RouteParams } from '../JurisdictionTableView';
import { pagesBuilder } from '../JurisdictionTableView/helpers/utils';

/** props for  JurisdictionTableListView */
export interface JurisdictionTableListViewProps extends WithWalkerProps {
  assignments: Assignment[];
  organizations: Organization[];
  plan: PlanDefinition | null;
  submitCallBackFunc: (assignments: Assignment[]) => void;
}

/**
 * This component renders the table for jurisdictions on the plans
 * assignment page and is a wrapper around the ListView component.
 * @param props - props that the JurisdictionTableListView component expects
 */

export type JurisdictionTableListViewPropTypes = RouteComponentProps<RouteParams> &
  JurisdictionTableListViewProps;

const JurisdictionTableListView = (props: JurisdictionTableListViewPropTypes) => {
  const { organizations, assignments, plan, submitCallBackFunc } = props;
  const currentChildren = props.currentChildren as TreeNode[];
  const currentNode = props.currentNode as TreeNode;

  if (!plan) {
    return null;
  }

  // we will use the jurisdiction id in the url to know if the parent
  // node has been set, if drilling down has began.
  let derivedChildrenNodes = currentChildren;
  if (!props.match.params.jurisdictionId) {
    derivedChildrenNodes = [currentNode];
  }

  const data = derivedChildrenNodes.map(node => {
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
        url={`${ASSIGN_PLAN_URL}/${plan.identifier}/${node.model.id}`}
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
  const { pages, currentPage } = pagesBuilder(props);
  return (
    <Fragment>
      <Breadcrumb className="reveal-breadcrumb plans-breadcrumb">
        <LinkList pages={pages} />
        <BreadcrumbItem active={true}>{currentPage.label}</BreadcrumbItem>
      </Breadcrumb>
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

const defaultProps = {
  ...defaultWalkerProps,
  assignments: [],
  organizations: [],
  submitCallBackFunc: () => null,
};

JurisdictionTableListView.defaultProps = defaultProps;

export { JurisdictionTableListView };
