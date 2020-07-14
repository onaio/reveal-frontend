/** the Jurisdiction Selection view
 * Responsibilities:
 *  load plan given a url with the planId
 *  pending : render map.
 *  render table from which a user can assign jurisdictions to the active plan
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ActionCreator, Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Ripple from '../../../../components/page/Loading';
import { getAncestors } from '../../../../components/TreeWalker/helpers';
import { JURISDICTION_METADATA_RISK } from '../../../../configs/env';
import {
  ASSIGN_JURISDICTIONS,
  COULD_NOT_LOAD_JURISDICTION,
  COULD_NOT_LOAD_PLAN,
  PLANNING_PAGE_TITLE,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { ASSIGN_JURISDICTIONS_URL, PLANNING_VIEW_URL } from '../../../../constants';
import {
  loadJurisdiction,
  loadJurisdictionsMetadata,
} from '../../../../helpers/dataLoading/jurisdictions';
import { loadOpenSRPPlan } from '../../../../helpers/dataLoading/plans';
import { displayError } from '../../../../helpers/errors';
import { OpenSRPService } from '../../../../services/opensrp';
import jurisdictionMetadataReducer, {
  fetchJurisdictionsMetadata,
  FetchJurisdictionsMetadataAction,
  getJurisdictionsMetadata,
  JurisdictionsMetadata,
  reducerName as jurisdictionMetadataReducerName,
} from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import plansReducer, {
  addPlanDefinition,
  AddPlanDefinitionAction,
  getPlanDefinitionById,
  reducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { ConnectedAssignmentMapWrapper } from '../../AssigmentMapWrapper/';
import { useHandleBrokenPage } from '../helpers/utils';
import { ConnectedJurisdictionTable } from '../JurisdictionTable';

reducerRegistry.register(reducerName, plansReducer);
reducerRegistry.register(jurisdictionMetadataReducerName, jurisdictionMetadataReducer);

/** this component's props */
export interface JurisdictionAssignmentViewProps {
  fetchJurisdictionsMetadataCreator: ActionCreator<FetchJurisdictionsMetadataAction>;
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
  jurisdictionsMetadata: JurisdictionsMetadata[];
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
}

export const defaultProps = {
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchPlanCreator: addPlanDefinition,
  jurisdictionsMetadata: [],
  plan: null,
  serviceClass: OpenSRPService,
};

/** view will require a planId from the url */
export interface RouteParams {
  planId: string;
  rootId?: string;
  parentId?: string;
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
  const {
    plan,
    serviceClass,
    fetchPlanCreator,
    fetchJurisdictionsMetadataCreator,
    jurisdictionsMetadata,
  } = props;

  const [rootJurisdictionId, setRootJurisdictionId] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(!plan);
  const { errorMessage, handleBrokenPage, broken } = useHandleBrokenPage();

  React.useEffect(() => {
    loadJurisdictionsMetadata(
      JURISDICTION_METADATA_RISK,
      OpenSRPService,
      fetchJurisdictionsMetadataCreator
    )
      .then(() => {
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(error => {
        displayError(error);
      });
  }, []);

  React.useEffect(() => {
    const planId = props.match.params.planId;
    setLoading(true);
    loadOpenSRPPlan(planId, serviceClass, fetchPlanCreator)
      .then(() => {
        setLoading(false);
      })
      .catch(_ => {
        handleBrokenPage(COULD_NOT_LOAD_PLAN);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    // getRoot jurisdiction of plan
    if (plan) {
      const oneOfJurisdictions = plan.jurisdiction.map(
        jurisdictionCode => jurisdictionCode.code
      )[0];
      setLoading(true);
      loadJurisdiction(oneOfJurisdictions, OpenSRPService)
        .then(result => {
          if (!result || result.error) {
            setLoading(false);
            throw new Error(COULD_NOT_LOAD_JURISDICTION);
          }
          if (result.value) {
            // TODO: review this - we already have the entire hierarchy in
            // the hierarchy reducer module, do we need to always call OpenSRP?
            getAncestors(result.value)
              .then(ancestors => {
                if (ancestors.value) {
                  // get the first ancestor
                  const rootJurisdiction = ancestors.value[0];
                  setRootJurisdictionId(rootJurisdiction.id);
                  setLoading(false);
                } else {
                  throw new Error(COULD_NOT_LOAD_JURISDICTION);
                }
              })
              .catch(e => {
                return e;
              });
          }
        })
        .catch(error => {
          handleBrokenPage(error.message);
        });
    }
  }, [plan]);

  if (loading) {
    return <Ripple />;
  }
  if (!plan) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_PLAN} />;
  }

  if (!rootJurisdictionId) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_JURISDICTION} />;
  }
  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  const JurisdictionTableProps = {
    currentParentId: props.match.params.parentId,
    jurisdictionsMetadata,
    plan,
    rootJurisdictionId,
    serviceClass,
  };

  const AssignmentWraperProps = {
    currentParentId: props.match.params.parentId,
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
      <ConnectedAssignmentMapWrapper {...AssignmentWraperProps} />
      <ConnectedJurisdictionTable {...JurisdictionTableProps} />
    </>
  );
};

JurisdictionAssignmentView.defaultProps = defaultProps;

type MapStateToProps =
  | Pick<JurisdictionAssignmentViewProps, 'plan'>
  | Pick<JurisdictionAssignmentViewProps, 'jurisdictionsMetadata'>;
type DispatchToProps =
  | Pick<JurisdictionAssignmentViewProps, 'fetchPlanCreator'>
  | Pick<JurisdictionAssignmentViewProps, 'fetchJurisdictionsMetadataCreator'>;

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionAssignmentViewFullProps
): MapStateToProps => {
  const planId = ownProps.match.params.planId;
  const planObj = getPlanDefinitionById(state, planId);
  return {
    jurisdictionsMetadata: getJurisdictionsMetadata(state),
    plan: planObj,
  };
};

const mapDispatchToProps: DispatchToProps = {
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchPlanCreator: addPlanDefinition,
};

const ConnectedJurisdictionAssignmentView = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionAssignmentView);

export default ConnectedJurisdictionAssignmentView;
