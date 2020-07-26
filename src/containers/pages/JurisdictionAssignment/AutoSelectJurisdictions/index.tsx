/** the Jurisdiction auto Selection view
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
import { TimelineSlider, TimelineSliderProps } from '../../../../components/TimeLineSlider';
import { JURISDICTION_METADATA_RISK } from '../../../../configs/env';
import {
  AUTO_TARGET_JURISDICTIONS_BY_RISK,
  COULD_NOT_LOAD_JURISDICTION,
  COULD_NOT_LOAD_PLAN,
  PLANNING_PAGE_TITLE,
  REFINE_SELECTED_JURISDICTIONS,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { AUTO_ASSIGN_JURISDICTIONS_URL, PLANNING_VIEW_URL } from '../../../../constants';
import { loadJurisdictionsMetadata } from '../../../../helpers/dataLoading/jurisdictions';
import { displayError } from '../../../../helpers/errors';
import { useLoadingReducer } from '../../../../helpers/useLoadingReducer';
import { OpenSRPService } from '../../../../services/opensrp';
import hierarchyReducer, {
  FetchedTreeAction,
  fetchTree,
  getTreeById,
  reducerName as hierarchyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
// import { ConnectedSelectedStructuresTable } from '../JurisdictionTable/structureSummary';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
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
  reducerName as planReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import {
  useGetJurisdictionTree,
  useGetRootJurisdictionId,
  usePlanEffect,
} from '../EntryView/utils';
import { ConnectedJurisdictionSelectionsSlider } from '../helpers/Slider';
import { useHandleBrokenPage } from '../helpers/utils';
import { ConnectedJurisdictionTable } from '../JurisdictionTable';
import { ConnectedSelectedStructuresTable } from '../JurisdictionTable/structureSummary';

reducerRegistry.register(planReducerName, plansReducer);
reducerRegistry.register(jurisdictionMetadataReducerName, jurisdictionMetadataReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** this component's props */
export interface JurisdictionAssignmentViewProps {
  fetchJurisdictionsMetadataCreator: ActionCreator<FetchJurisdictionsMetadataAction>;
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
  jurisdictionsMetadata: JurisdictionsMetadata[];
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: ActionCreator<FetchedTreeAction>;
  tree?: TreeNode;
}

export const defaultProps = {
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchPlanCreator: addPlanDefinition,
  jurisdictionsMetadata: [],
  plan: null,
  serviceClass: OpenSRPService,

  treeFetchedCreator: fetchTree,
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
 *  2). pull metadata
 *  3). pull rootJurisdiction after getting plan in 1
 *      -> Each of the above calls are needed for this component to work
 *  4). render drillDown table where, user can select assignments
 */
export const AutoSelectView = (props: JurisdictionAssignmentViewFullProps) => {
  const {
    plan,
    serviceClass,
    fetchPlanCreator,
    fetchJurisdictionsMetadataCreator,
    jurisdictionsMetadata,
    treeFetchedCreator,
  } = props;

  const { errorMessage, handleBrokenPage, broken } = useHandleBrokenPage();
  const [step, setStep] = React.useState<number>(1);
  const initialLoadingState = !jurisdictionsMetadata || !plan;
  const { startLoading, stopLoading, loading } = useLoadingReducer(initialLoadingState);

  React.useEffect(() => {
    const metadataLoadingKey = startLoading('metadata');
    loadJurisdictionsMetadata(
      JURISDICTION_METADATA_RISK,
      OpenSRPService,
      fetchJurisdictionsMetadataCreator
    )
      .then(() => {
        stopLoading(metadataLoadingKey);
      })
      .finally(() => {
        stopLoading(metadataLoadingKey);
      })
      .catch(error => {
        displayError(error);
      });
  }, []);

  usePlanEffect(
    props.match.params.planId,
    plan,
    serviceClass,
    fetchPlanCreator,
    handleBrokenPage,
    stopLoading,
    startLoading
  );

  const rootJurisdictionId = useGetRootJurisdictionId(
    plan,
    serviceClass,
    handleBrokenPage,
    stopLoading,
    startLoading
  );

  useGetJurisdictionTree(
    rootJurisdictionId,
    startLoading,
    treeFetchedCreator,
    stopLoading,
    handleBrokenPage
  );

  if (loading()) {
    return <Ripple />;
  }

  if (!plan) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_PLAN} />;
  }

  // TODO - can we use the tree here instead.
  if (!rootJurisdictionId) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_JURISDICTION} />;
  }

  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  const sliderProps = {
    onClickNext: () => setStep(step + 1),
    plan,
    rootJurisdictionId,
    serviceClass,
  };

  const jurisdictionTableProps = {
    autoSelectionFlow: true,
    currentParentId: props.match.params.parentId,
    jurisdictionsMetadata,
    plan,
    rootJurisdictionId,
    serviceClass,
  };

  const breadcrumbProps = {
    currentPage: {
      label: plan.title,
      url: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
    },
    pages: [
      {
        label: PLANNING_PAGE_TITLE,
        url: PLANNING_VIEW_URL,
      },
    ],
  };

  const timelineSliderProps: TimelineSliderProps = {
    keyOfCurrentStop: step.toString(),
    stops: [
      {
        keys: '1',
        labelBelowStop: AUTO_TARGET_JURISDICTIONS_BY_RISK,
        labelInStop: '1',
      },
      {
        keys: ['2', '3'],
        labelBelowStop: REFINE_SELECTED_JURISDICTIONS,
        labelInStop: '2',
      },
    ],
  };

  const pageTitle = plan.title;
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <TimelineSlider {...timelineSliderProps} />
      {step === 1 && <ConnectedJurisdictionSelectionsSlider {...sliderProps} />}
      {step === 2 && <ConnectedSelectedStructuresTable {...jurisdictionTableProps} />}
      {step === 3 && <ConnectedJurisdictionTable {...jurisdictionTableProps} />}
    </>
  );
};

AutoSelectView.defaultProps = defaultProps;

type MapStateToProps = Pick<
  JurisdictionAssignmentViewProps,
  'plan' | 'jurisdictionsMetadata' | 'tree'
>;
type DispatchToProps = Pick<
  JurisdictionAssignmentViewProps,
  'fetchPlanCreator' | 'fetchJurisdictionsMetadataCreator' | 'treeFetchedCreator'
>;

const treeByIdSelector = getTreeById();

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionAssignmentViewFullProps
): MapStateToProps => {
  const planId = ownProps.match.params.planId;
  const planObj = getPlanDefinitionById(state, planId);

  return {
    jurisdictionsMetadata: getJurisdictionsMetadata(state),
    plan: planObj,
    tree: treeByIdSelector(state, { rootJurisdictionId: ownProps.match.params.rootId || '' }),
  };
};

const mapDispatchToProps: DispatchToProps = {
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchPlanCreator: addPlanDefinition,
  treeFetchedCreator: fetchTree,
};

const ConnectedAutoSelectView = connect(mapStateToProps, mapDispatchToProps)(AutoSelectView);

export default ConnectedAutoSelectView;
