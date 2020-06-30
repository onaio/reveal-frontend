// container/view that lists draft plans. part of planning tool.
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { CREATE_NEW_PLAN, DRAFT_PLANS, HOME } from '../../../../configs/lang';
import { HOME_URL, NEW, PLANNING_VIEW_URL } from '../../../../constants';
import {
  createConnectedOpenSRPPlansList,
  OpenSRPPlanListViewProps,
  RenderProp,
} from './OpenSRPPlansList';

const ConnectedOpenSRPPlansList = createConnectedOpenSRPPlansList();

/** list draft plans */
export const DraftPlans = (props: RouteComponentProps) => {
  const pageTitle = DRAFT_PLANS;
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: DRAFT_PLANS,
      url: PLANNING_VIEW_URL,
    },
    pages: [homePage],
  };

  const renderBody = (renderProp: RenderProp) => {
    return (
      <div className="mb-5">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">{pageTitle}</h2>
        {renderProp()}
        <br />
        <Button
          className="create-plan"
          color="primary"
          tag={Link}
          to={`${PLANNING_VIEW_URL}/${NEW}`}
        >
          {CREATE_NEW_PLAN}
        </Button>
      </div>
    );
  };

  const opensrpListProps: Partial<OpenSRPPlanListViewProps> & RouteComponentProps = {
    ...props,
    renderBody,
  };

  return <ConnectedOpenSRPPlansList {...opensrpListProps} />;
};
