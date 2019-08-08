import ListView from '@onaio/list-view';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { PlanDefinition } from '../../../../configs/settings';
import { HOME, HOME_URL, PLAN_LIST_URL, PLANS } from '../../../../constants';
import { fetchPlanDefinitions } from '../../../../store/ducks/opensrp/PlanDefinition';

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchPlanDefinitions;
  plans: PlanDefinition[];
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const PlanDefinitionList = (props: PlanListProps) => {
  const { plans } = props;

  const pageTitle: string = PLANS;

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: `${PLAN_LIST_URL}`,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  const listViewProps = {
    data: plans.map(planObj => {
      const typeUseContext = planObj.useContext.filter(e => e.code === 'interventionType');

      return [
        planObj.title,
        typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : '',
        planObj.status,
        planObj.date,
      ];
    }),
    headerItems: ['Title', 'Intervention Type', 'Status', 'Last Modified'],
    tableClass: 'table table-striped plans-list',
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <Row>
        <Col>
          <ListView {...listViewProps} />
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for PlanDefinitionList */
const defaultProps: PlanListProps = {
  fetchPlans: fetchPlanDefinitions,
  plans: [],
};

PlanDefinitionList.defaultProps = defaultProps;

export default PlanDefinitionList;
