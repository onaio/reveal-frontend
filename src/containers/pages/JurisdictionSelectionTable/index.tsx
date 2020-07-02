/** the Jurisdiction Selection view
 * Responsibilities:
 *  load plan given a url with the planId
 *  pending : render map.
 *  render table from which a user can assign jurisdictions to the active plan
 */

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ActionCreator, Store } from 'redux';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { ASSIGN_JURISDICTIONS, PLANNING_PAGE_TITLE } from '../../../configs/lang';
import { PlanDefinition } from '../../../configs/settings';
import { ASSIGN_JURISDICTIONS_URL, PLANNING_VIEW_URL } from '../../../constants';
import { loadOpenSRPPlan } from '../../../helpers/dataLoading/plans';
import { displayError } from '../../../helpers/errors';
import { OpenSRPService } from '../../../services/opensrp';
import {
  addPlanDefinition,
  AddPlanDefinitionAction,
  getPlanDefinitionById,
} from '../../../store/ducks/opensrp/PlanDefinition';
import { JurisdictionSelectorTableProps, JurisdictionTable } from './JurisdictionTable';
import { getAncestors } from '../../../components/TreeWalker/helpers';
import { loadJurisdiction } from '../../../helpers/dataLoading/jurisdictions';
import { selectorState } from '../OrganizationViews/SingleOrganizationView/tests/fixtures';
import { getAccessToken } from '../../../store/selectors';

export interface JurisdictionAssignmentViewProps {
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
}

export const defaultProps = {
  fetchPlanCreator: addPlanDefinition,
  plan: null,
  serviceClass: OpenSRPService,
};

/** view will require a planId from the url */
interface RouteParams {
  planId: string;
}

/** full props with route props added for JurisdictionAssignmentView */
export type JurisdictionAssignmentViewFullProps = JurisdictionAssignmentViewProps &
  RouteComponentProps<RouteParams>;

/**
 * Responsibilities:
 *  1). get plan from api
 *  2). render drillDown table where, user can select assignments
 */
export const JurisdictionAssignmentView = (props: JurisdictionAssignmentViewFullProps) => {
  const { plan, serviceClass, fetchPlanCreator } = props;
  const [rootJurisdictionId, setRootJurisdictionId] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const planId = props.match.params.planId;
    loadOpenSRPPlan(planId, serviceClass, fetchPlanCreator).catch((err: Error) => {
      displayError(err);
    });
  }, []);

  React.useEffect(() => {
    // getRoot jurisdiction of plan
    if (plan) {
      const oneOfJurisdictions = plan.jurisdiction.map(
        jurisdictionCode => jurisdictionCode.code
      )[0];
      loadJurisdiction(oneOfJurisdictions, OpenSRPService)
        .then(result => {
          if (result && !result.error) {
            getAncestors(result.value)
              .then(ancestors => {
                if (ancestors.value) {
                  // get the first ancestor
                  const rootJurisdiction = ancestors.value[0];
                  setRootJurisdictionId(rootJurisdiction.id);
                  console.log('Root Jurisdiction', rootJurisdictionId);
                }
              })
              .catch(_ => {});
          }
        })
        .catch(_ => {});
    }
  }, [plan]);

  if(!plan){
    return <>Failed to load the plan</>
  }

  if (!rootJurisdictionId) {
    // TODO - show error page
    return <>Failed to load rootJurisdiction</>;
  }
  const JurisdictionTableProps: JurisdictionSelectorTableProps = {
    plan,
    rootJurisdictionId,
    serviceClass,
  };

  const breadcrumbProps = {
    currentPage: {
      label: plan.title,
      url: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
    },
    pages: [
      {
        label: PLANNING_PAGE_TITLE,
        url: PLANNING_VIEW_URL,
      },
    ],
  };

  const pageTitle = ASSIGN_JURISDICTIONS;
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <JurisdictionTable {...JurisdictionTableProps} />
    </>
  );
};

JurisdictionAssignmentView.defaultProps = defaultProps;

type MapStateToProps = Pick<JurisdictionAssignmentViewProps, 'plan'>;
type DispatchToProps = Pick<JurisdictionAssignmentViewProps, 'fetchPlanCreator'>;

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionAssignmentViewFullProps
): MapStateToProps => {
  const planId = ownProps.match.params.planId;
  const planObj = getPlanDefinitionById(state, planId);
  return {
    plan: planObj,
  };
};

const mapDispatchToProps: DispatchToProps = {
  fetchPlanCreator: addPlanDefinition,
};

const ConnectedJurisdictionAssignmentView = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionAssignmentView);

export default ConnectedJurisdictionAssignmentView;
