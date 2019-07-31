import React from 'react';
import { Helmet } from 'react-helmet';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { FI_HISTORICAL_URL, FOCUS_INVESTIGATIONS, HOME, HOME_URL } from '../../../../constants';
import PlanForm from '../../../forms/PlanForm';

/** Simple component that loads the new plan form and allows you to create a new plan */
const NewPlan = () => {
  const pageTitle: string = 'Create New Plan';
  const baseFIPage = {
    label: FOCUS_INVESTIGATIONS,
    url: `${FI_HISTORICAL_URL}`,
  };
  const breadcrumbProps = {
    currentPage: baseFIPage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
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
      <PlanForm disabledFields={['status']} />
    </div>
  );
};

export default NewPlan;
