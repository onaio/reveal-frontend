import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { format } from 'util';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { CREATE_NEW_PLAN, FIS_IN_JURISDICTION, HOME, PLANS } from '../../../../../configs/lang';
import { FI_SINGLE_URL, HOME_URL, NEW_PLAN_URL, PLAN_LIST_URL } from '../../../../../constants';
import { InterventionType } from '../../../../../store/ducks/plans';
import PlanForm, { defaultInitialValues } from '../../../../forms/PlanForm';

/** Simple component that loads the new plan form and allows you to create a new plan */
const NewPlan = () => {
  const [formValues, setFormValues] = useState(defaultInitialValues);
  const formValuesHandler = (curr: any, next: any) => {
    setFormValues(next.values);
  };

  const pageTitle: string = CREATE_NEW_PLAN;

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: `${NEW_PLAN_URL}`,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: PLANS,
        url: PLAN_LIST_URL,
      },
    ],
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <Row>
        <Col md={8} id="planform-col-container">
          <PlanForm {...{ formHandler: formValuesHandler }} />
        </Col>
        <Col md={4}>
          {formValues.interventionType === InterventionType.FI &&
            formValues.jurisdictions[0].id !== '' && (
              <Link to={`${FI_SINGLE_URL}/${formValues.jurisdictions[0].id}`}>
                {format(FIS_IN_JURISDICTION, formValues.jurisdictions[0].name)}
              </Link>
            )}
        </Col>
      </Row>
    </div>
  );
};

export default NewPlan;
