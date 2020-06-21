import ListView from '@onaio/list-view';
import superset from '@onaio/superset-connector';
import moment from 'moment';
import React, { Fragment, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import HeaderBreadcrumb from '../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, NO_ROWS_FOUND } from '../../configs/lang';
import { PlanDefinition } from '../../configs/settings';
import {
  ASSIGN2_PLAN_URL,
  HOME_URL,
  OPENSRP_GET_ASSIGNMENTS_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PLANS,
} from '../../constants';
import { displayError } from '../../helpers/errors';
import { OpenSRPService } from '../../services/opensrp';
import supersetFetch from '../../services/superset';
import { Assignment } from '../../store/ducks/opensrp/assignments';
import { Organization } from '../../store/ducks/opensrp/organizations';
import { defaultWalkerProps, withTreeWalker, WithWalkerProps } from './';
import { AssignedOrgs } from './AssignedOrgs';
import { EditOrg } from './EditOrg';
import { SimpleJurisdiction } from './types';

interface BaseProps extends WithWalkerProps {
  assignments: Assignment[];
  organizations: Organization[];
  plan: PlanDefinition | null;
}

/** Route params interface */
export interface RouteParams {
  jurisdictionId: string;
  planId: string;
}

type XXX = RouteComponentProps<RouteParams> & BaseProps;

const Base = (props: XXX) => {
  const { assignments, currentChildren, currentNode, hierarchy, organizations, plan } = props;

  if (!plan) {
    return null;
  }

  const pageTitle = 'Better Assignments';

  const breadcrumbProps = {
    currentPage: {
      label: currentNode ? 'loading...' : pageTitle,
      url: `${ASSIGN2_PLAN_URL}`,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  if (currentNode) {
    breadcrumbProps.pages.push({
      label: pageTitle,
      url: `${ASSIGN2_PLAN_URL}`,
    });
  }

  for (let index = 0; index < hierarchy.length; index++) {
    const element = hierarchy[index];
    if (index < hierarchy.length - 1) {
      breadcrumbProps.pages.push({
        label: element.properties.name,
        url: `${ASSIGN2_PLAN_URL}/${element.id}`,
      });
    } else {
      breadcrumbProps.currentPage = {
        label: element.properties.name,
        url: `${ASSIGN2_PLAN_URL}/${element.id}`,
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
      <Link key={`${node.id}-link`} to={`${ASSIGN2_PLAN_URL}/${plan.identifier}/${node.id}`}>
        {node.properties.name}
      </Link>,
      <AssignedOrgs key={`${node.id}-txt`} id={node.id} orgs={jurisdictionOrgs} />,
      <EditOrg
        defaultValue={selectedOrgs}
        jurisdiction={node}
        key={`${node.id}-form`}
        options={orgOptions}
        plan={plan}
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

const defaultX: BaseProps = {
  ...defaultWalkerProps,
  assignments: [],
  organizations: [],
  plan: null,
};

Base.defaultProps = defaultX;

// const Simple = withTreeWalker<XXX>(Base);

const Exposed = (props: XXX) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hierarchyLimits, setHierarchyLimits] = useState<SimpleJurisdiction[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plan, setPlan] = useState<PlanDefinition | null>(null);

  const planId = props.match.params.planId;

  if (!planId) {
    return null;
  }

  /** define superset filter params for jurisdictions */
  const supersetParams = superset.getFormData(15000, [
    { comparator: planId, operator: '==', subject: 'plan_id' },
  ]);

  useEffect(() => {
    supersetFetch('577', supersetParams)
      .then((result: SimpleJurisdiction[]) => {
        if (result) {
          setHierarchyLimits(result);
        }
      })
      .finally(() => setLoading(false))
      .catch(e => displayError(e));

    // get all assignments
    const OpenSrpAssignedService = new OpenSRPService(OPENSRP_GET_ASSIGNMENTS_ENDPOINT);
    OpenSrpAssignedService.list({ plan: planId })
      .then((response: any[]) => {
        // TODO: remove any
        if (response) {
          const receivedAssignments: Assignment[] = response.map(assignment => {
            return {
              fromDate: moment(assignment.fromDate).format(),
              jurisdiction: assignment.jurisdictionId,
              organization: assignment.organizationId,
              plan: assignment.planId,
              toDate: moment(assignment.toDate).format(),
            };
          });
          setAssignments(receivedAssignments);
          // console.log('receivedAssignments >>> ', receivedAssignments);
          // store.dispatch(fetchAssignmentsActionCreator(assignments));
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));

    // fetch all organizations
    const OpenSRPOrganizationService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
    OpenSRPOrganizationService.list()
      .then((response: Organization[]) => {
        if (response) {
          setOrganizations(response);
          // console.log('Organizations >>> ', response);
          // save all organizations to store
          // store.dispatch(fetchOrganizationsActionCreator(response));
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));

    // fetch current plan
    const OpenSRPPlanService = new OpenSRPService(OPENSRP_PLANS);
    OpenSRPPlanService.read(planId)
      .then((response: PlanDefinition[]) => {
        if (response && response.length > 0) {
          setPlan(response[0]);
          // console.log('currentPlan >>> ', response[0]);
        }
        // TODO: add error if no response
      })
      .catch(e => displayError(e));
  }, []);

  if (loading) {
    return <Fragment>plan hierarchy loading...</Fragment>;
  }

  let jurisdictionId = props.match.params.jurisdictionId;
  if (!jurisdictionId) {
    jurisdictionId = '';
  }

  const Wrapped = withTreeWalker<XXX>(Base);

  const wrappedProps = {
    ...props,
    assignments,
    jurisdictionId,
    limits: hierarchyLimits,
    organizations,
    plan,
  };

  return <Wrapped {...wrappedProps} />;
};

// export default Simple;
export default Exposed;
