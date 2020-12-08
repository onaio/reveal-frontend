/** the Jurisdiction auto Selection view.
 * Takes the user through the process of auto-selecting jurisdictions based
 * on uploaded risks.
 * the first step is using a slider to set the threshold
 * the second step is using a drill-down table to see the number of structures in the selected nodes
 * the third step is using another drill-down to refine the selected.
 *
 *  Responsibilities:
 *  load plan given a url with the planId
 *  also requires the hierarchy
 *
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Ripple from '../../../../components/page/Loading';
import { TimelineSlider, TimelineSliderProps } from '../../../../components/TimeLineSlider';
import { ASSIGNMENT_PAGE_SHOW_MAP, JURISDICTION_METADATA_RISK } from '../../../../configs/env';
import {
  AUTO_TARGET_JURISDICTIONS_BY_RISK,
  COULD_NOT_LOAD_JURISDICTION_HIERARCHY,
  COULD_NOT_LOAD_PLAN,
  PLANNING_PAGE_TITLE,
  REFINE_SELECTED_JURISDICTIONS,
  TIMELINE_SLIDER_STOP1_LABEL,
  TIMELINE_SLIDER_STOP2_LABEL,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import {
  AUTO_ASSIGN_JURISDICTIONS_URL,
  PLANNING_VIEW_URL,
  TIMELINE_SLIDER_STEP1,
  TIMELINE_SLIDER_STEP2,
  TIMELINE_SLIDER_STEP3,
} from '../../../../constants';
import { loadJurisdictionsMetadata } from '../../../../helpers/dataLoading/jurisdictions';
import { displayError } from '../../../../helpers/errors';
import { useLoadingReducer } from '../../../../helpers/useLoadingReducer';
import { OpenSRPService } from '../../../../services/opensrp';
import hierarchyReducer, {
  fetchTree,
  getTreeById,
  reducerName as hierarchyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import jurisdictionMetadataReducer, {
  fetchJurisdictionsMetadata,
  getJurisdictionsMetadata,
  JurisdictionsMetadata,
  reducerName as jurisdictionMetadataReducerName,
} from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import plansReducer, {
  addPlanDefinition,
  getPlanDefinitionById,
  reducerName as planReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { ConnectedAssignmentMapWrapper } from '../../AssigmentMapWrapper';
import { useGetJurisdictionTree, usePlanEffect } from '../EntryView/utils';
import { ConnectedJurisdictionTable } from '../helpers/JurisdictionTable';
import { ConnectedResourceWidget } from '../helpers/ResourceCalcWidget';
import { ConnectedJurisdictionSelectionsSlider } from '../helpers/Slider';
import { ConnectedSelectedStructuresTable } from '../helpers/StructureCountTable/structureSummary';
import { useHandleBrokenPage } from '../helpers/utils';
import './index.css';

reducerRegistry.register(planReducerName, plansReducer);
reducerRegistry.register(jurisdictionMetadataReducerName, jurisdictionMetadataReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** this component's props */
export interface JurisdictionAssignmentViewProps {
  fetchJurisdictionsMetadataCreator: typeof fetchJurisdictionsMetadata;
  fetchPlanCreator: typeof addPlanDefinition;
  jurisdictionsMetadata: JurisdictionsMetadata[];
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: typeof fetchTree;
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
  rootId: string;
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
    tree,
  } = props;

  const { errorMessage, handleBrokenPage, broken } = useHandleBrokenPage();
  const [step, setStep] = React.useState<string>(TIMELINE_SLIDER_STEP1);
  const initialLoadingState = jurisdictionsMetadata.length === 0 || !plan;
  const { startLoading, stopLoading, loading } = useLoadingReducer(initialLoadingState);
  const { rootId: rootJurisdictionId, planId } = props.match.params;

  React.useEffect(() => {
    const metadataLoadingKey = 'metadata';
    startLoading(metadataLoadingKey, jurisdictionsMetadata.length === 0);
    loadJurisdictionsMetadata(
      JURISDICTION_METADATA_RISK,
      OpenSRPService,
      fetchJurisdictionsMetadataCreator
    )
      .finally(() => {
        stopLoading(metadataLoadingKey);
      })
      .catch(error => {
        displayError(error);
      });
  }, []);

  usePlanEffect(
    planId,
    plan,
    serviceClass,
    fetchPlanCreator,
    handleBrokenPage,
    stopLoading,
    startLoading
  );

  useGetJurisdictionTree(
    rootJurisdictionId,
    startLoading,
    treeFetchedCreator,
    stopLoading,
    handleBrokenPage,
    tree
  );

  if (loading()) {
    return <Ripple />;
  }

  if (!plan) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_PLAN} />;
  }

  if (!tree) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_JURISDICTION_HIERARCHY} />;
  }

  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  const sliderProps = {
    onClickNext: () => setStep(TIMELINE_SLIDER_STEP2),
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

  const structureSummaryProps = {
    currentParentId: props.match.params.parentId,
    onClickNext: () => setStep(TIMELINE_SLIDER_STEP3),
    planId: plan.identifier,
    rootJurisdictionId,
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
    keyOfCurrentStop: step,
    stops: [
      {
        keys: TIMELINE_SLIDER_STEP1,
        labelBelowStop: AUTO_TARGET_JURISDICTIONS_BY_RISK,
        labelInStop: TIMELINE_SLIDER_STOP1_LABEL,
      },
      {
        keys: [TIMELINE_SLIDER_STEP2, TIMELINE_SLIDER_STEP3],
        labelBelowStop: REFINE_SELECTED_JURISDICTIONS,
        labelInStop: TIMELINE_SLIDER_STOP2_LABEL,
      },
    ],
  };

  const resourceCalculationProps = {
    currentParentId: props.match.params.parentId,
    planId: plan.identifier,
    rootId: rootJurisdictionId,
  };

  const AssignmentWrapperProps = {
    baseAssignmentURL: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`,
    currentParentId: props.match.params.parentId,
    jurisdictionsChunkSize: 30,
    plan,
    rootJurisdictionId,
    serviceClass,
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
      <hr />
      {/* each of these components is a step in the auto selection journey, we start
      at the slider and go through a few tables and we should ideally end at plan assignment
      each of this components gets a callback that is called that modifies the state of this
      container to know what is the next component to be rendered in the below section */}
      {step !== TIMELINE_SLIDER_STEP1 && (
        <div className="map-resource-widget">
          <div className="map-wrapper">
            {ASSIGNMENT_PAGE_SHOW_MAP && (
              <ConnectedAssignmentMapWrapper {...AssignmentWrapperProps} />
            )}
          </div>
          <ConnectedResourceWidget {...resourceCalculationProps} />
        </div>
      )}
      {step === TIMELINE_SLIDER_STEP1 && <ConnectedJurisdictionSelectionsSlider {...sliderProps} />}
      {step === TIMELINE_SLIDER_STEP2 && (
        <ConnectedSelectedStructuresTable {...structureSummaryProps} />
      )}
      {step === TIMELINE_SLIDER_STEP3 && <ConnectedJurisdictionTable {...jurisdictionTableProps} />}
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
  const tree = treeByIdSelector(state, {
    rootJurisdictionId: ownProps.match.params.rootId,
  });

  return {
    jurisdictionsMetadata: getJurisdictionsMetadata(state),
    plan: planObj,
    tree,
  };
};

const mapDispatchToProps: DispatchToProps = {
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchPlanCreator: addPlanDefinition,
  treeFetchedCreator: fetchTree,
};

const ConnectedAutoSelectView = connect(mapStateToProps, mapDispatchToProps)(AutoSelectView);

export default ConnectedAutoSelectView;
