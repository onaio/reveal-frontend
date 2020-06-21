import ListView from '@onaio/list-view';
import superset from '@onaio/superset-connector';
import moment from 'moment';
import React, { Fragment, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import HeaderBreadcrumb from '../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, NO_ROWS_FOUND } from '../../configs/lang';
import {
  ASSIGN2_PLAN_URL,
  HOME_URL,
  OPENSRP_GET_ASSIGNMENTS_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
} from '../../constants';
import { displayError } from '../../helpers/errors';
import { OpenSRPService } from '../../services/opensrp';
import supersetFetch from '../../services/superset';
import { Assignment } from '../../store/ducks/opensrp/assignments';
import { Organization } from '../../store/ducks/opensrp/organizations';
import { defaultWalkerProps, withTreeWalker, WithWalkerProps } from './';
import { SimpleJurisdiction } from './types';

interface BaseProps extends WithWalkerProps {
  assignments: Assignment[];
  organizations: Organization[];
}

/** Route params interface */
export interface RouteParams {
  jurisdictionId: string;
}

type XXX = RouteComponentProps<RouteParams> & BaseProps;

const Base = (props: XXX) => {
  const { assignments, currentChildren, currentNode, hierarchy, organizations } = props;

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

    const jurisdictionOrgNames = jurisdictionOrgs.map(org => org.name).join(', ');

    return [
      <Link key={node.id} to={`${ASSIGN2_PLAN_URL}/${node.id}`}>
        {node.properties.name}
      </Link>,
      `${jurisdictionOrgNames}`,
      'Assign Team Button Goes Here',
    ];
  });
  const headerItems = ['Name', 'Team Assignment', '???'];
  const tableClass = 'table table-bordered';

  const listViewProps = {
    data,
    headerItems,
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
};

Base.defaultProps = defaultX;

// const Simple = withTreeWalker<XXX>(Base);

const Exposed = (props: XXX) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hierarchyLimits, setHierarchyLimits] = useState<SimpleJurisdiction[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  /** define superset filter params for jurisdictions */
  const planId = 'd05e8df9-7b6a-58a4-98a3-d76daf7cf0b9';
  const supersetParams = superset.getFormData(1, [
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
  };

  return <Wrapped {...wrappedProps} />;
};

// export default Simple;
export default Exposed;
