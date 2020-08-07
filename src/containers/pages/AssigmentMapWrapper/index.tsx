import { viewport } from '@mapbox/geo-viewport';
import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import { Feature, FeatureCollection } from '@turf/turf';
import { History } from 'history';
import { EventData, Map } from 'mapbox-gl';
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { ActionCreator, Store } from 'redux';
import { CountriesAdmin0, PlanDefinition } from '../../../../src/configs/settings';
import { MemoizedGisidaLite } from '../../../components/GisidaLite';
import Loading from '../../../components/page/Loading';
import { getJurisdictions } from '../../../components/TreeWalker/helpers';
import { MAP_LOAD_ERROR } from '../../../configs/lang';
import { AUTO_ASSIGN_JURISDICTIONS_URL, MANUAL_ASSIGN_JURISDICTIONS_URL } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { OpenSRPService } from '../../../services/opensrp';
import {
  autoSelectNodes,
  AutoSelectNodesAction,
  deselectNode,
  DeselectNodeAction,
  fetchUpdatedCurrentParent,
  Filters,
  getCurrentChildren,
  getCurrentParentNode,
  getMapCurrentParent,
  getMetaData,
  selectNode,
  SelectNodeAction,
} from '../../../store/ducks/opensrp/hierarchies';
import { SELECTION_REASON } from '../../../store/ducks/opensrp/hierarchies/constants';
import { Meta, TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
import { nodeIsSelected } from '../../../store/ducks/opensrp/hierarchies/utils';
import jurisdictionReducer, {
  fetchJurisdictions,
  Filters as JurisdictionGeomFilters,
  getJurisdictionsById,
  getJurisdictionsFC,
  reducerName as jurisdictionReducerName,
} from '../../../store/ducks/opensrp/jurisdictions';
import {
  buildMouseMoveHandler,
  buildStructureLayers,
} from '../FocusInvestigation/map/active/helpers/utils';

reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** props for Plan jurisdiction and team assignment higher order component */
export interface AssignmentMapWrapperProps {
  autoSelectionFlow: boolean;
  plan: PlanDefinition;
  rootJurisdictionId: string;
  currentParentId?: string;
  getJurisdictionsMetadata: Dictionary<Dictionary<Dictionary<Meta>>>;
  currentChildren: TreeNode[];
  serviceClass: typeof OpenSRPService;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchUpdatedCurrentParentActionCreator: typeof fetchUpdatedCurrentParent;
  getJurisdictionsFeatures: FeatureCollection;
  autoSelectNodesActionCreator: ActionCreator<AutoSelectNodesAction>;
  selectNodeCreator: ActionCreator<SelectNodeAction>;
  deselectNodeCreator: ActionCreator<DeselectNodeAction>;
  currentParentNode?: TreeNode;
}

/** default value for feature Collection */
const defaultFeatureCollection: FeatureCollection = {
  features: [],
  type: 'FeatureCollection',
};

const defaultProps: AssignmentMapWrapperProps = {
  autoSelectNodesActionCreator: autoSelectNodes,
  autoSelectionFlow: false,
  currentChildren: [],
  currentParentId: undefined,
  currentParentNode: undefined,
  deselectNodeCreator: deselectNode,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchUpdatedCurrentParentActionCreator: fetchUpdatedCurrentParent,
  getJurisdictionsFeatures: defaultFeatureCollection,
  getJurisdictionsMetadata: {},
  plan: {} as PlanDefinition,
  rootJurisdictionId: '',
  selectNodeCreator: selectNode,
  serviceClass: OpenSRPService,
};

/**
 * Handler to get current parent id from clicked jurisdiction on map
 * @param props - AssignmentMapWrapper component props
 */

export const onJurisdictionClick = (props: any, setMapParent: any, history: History) => {
  function handleJurisdictionClick(_: Map, e: EventData) {
    // Destructure event data
    const { point, target, originalEvent } = e;
    const {
      currentParentNode,
      rootJurisdictionId,
      selectNodeCreator,
      deselectNodeCreator,
      plan,
      autoSelectionFlow,
      getJurisdictionsMetadata,
    } = props;

    const baseUrl = !autoSelectionFlow
      ? `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`
      : `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`;
    // grab underlying features from map
    const features: Feature[] = target.queryRenderedFeatures(point);
    if (!features.length) {
      return false;
    }
    if (features[0]) {
      const currentId =
        (features[0].id && features[0].id.toString()) ||
        (features[0] && features[0].properties && features[0].properties.externalId);
      if (originalEvent.altKey) {
        let activeCurrentNode: TreeNode | any = {};
        // Handle selection for admin level 0
        if (
          currentParentNode &&
          currentParentNode.model.id === rootJurisdictionId &&
          currentId === currentParentNode.model.id
        ) {
          activeCurrentNode = currentParentNode;
        } else {
          // Handle selection for admin > 0
          activeCurrentNode = currentParentNode.children.find(
            (node: TreeNode) => node.model.id === currentId
          );
        }
        if (
          !nodeIsSelected(
            activeCurrentNode.model.id,
            rootJurisdictionId,
            plan.identifier,
            getJurisdictionsMetadata
          )
        ) {
          selectNodeCreator(
            rootJurisdictionId,
            activeCurrentNode.model.id,
            plan.identifier,
            SELECTION_REASON.USER_CHANGE
          );
        } else {
          deselectNodeCreator(
            rootJurisdictionId,
            activeCurrentNode.model.id,
            plan.identifier,
            SELECTION_REASON.USER_CHANGE
          );
        }
        setMapParent(currentId);
      } else {
        if (currentParentNode.hasChildren()) {
          history.push(`${baseUrl}/${currentId}`);
        }
      }
    }
  }
  return handleJurisdictionClick;
};

/**
 * This is a map HOC for the plan and jurisdiction assignment pages
 * It is responsuble for fetching jurisdiction geojson and wiring down to
 * GisidaLite map
 * @param props - component props
 */

const AssignmentMapWrapper = (props: AssignmentMapWrapperProps) => {
  const {
    serviceClass,
    currentChildren,
    fetchJurisdictionsActionCreator,
    getJurisdictionsFeatures,
    currentParentId,
    rootJurisdictionId,
  } = props;
  const currentChildIds: string[] = currentChildren.length
    ? currentChildren.map(node => node.model.id)
    : [];
  const [loading, setLoading] = React.useState<boolean>(false);
  const [mapParent, setMapParent] = React.useState<string>('');
  const jurisdictionLabels = currentChildren.map(d => d.model.label);
  const history = useHistory();
  onJurisdictionClick(props, setMapParent, history);

  React.useEffect(() => {
    if (!getJurisdictionsFeatures.features.length) {
      setLoading(true);
      const params = {
        is_jurisdiction: true,
        return_geometry: true,
      };
      getJurisdictions(
        !currentParentId ? [rootJurisdictionId] : currentChildIds,
        params,
        30,
        serviceClass
      )
        .then(res => {
          if (res.value && res.value.length && currentChildren.length) {
            fetchJurisdictionsActionCreator(res.value);
            setLoading(false);
          }
        })
        .finally(() => {
          setLoading(false);
        })
        .catch(error => displayError(error));
    }
  }, [getJurisdictionsFeatures, currentParentId]);

  React.useEffect(() => {
    if (mapParent.length) {
      fetchJurisdictionsActionCreator(getJurisdictionsFeatures.features as any);
      setMapParent('');
    }
  }, [getJurisdictionsFeatures, mapParent]);

  let structures: JSX.Element[] = [];
  let mapCenter;
  let mapBounds;
  let zoom;
  if (getJurisdictionsFeatures && getJurisdictionsFeatures.features.length) {
    structures = buildStructureLayers(getJurisdictionsFeatures as any, true);
    if (Object.keys(CountriesAdmin0).filter(admin => jurisdictionLabels.includes(admin)).length) {
      mapCenter = undefined;
      mapBounds = undefined;
    } else {
      mapBounds = GeojsonExtent(getJurisdictionsFeatures);
      const centerAndZoom = viewport(mapBounds, [600, 400]);
      mapCenter = centerAndZoom.center;
      zoom = centerAndZoom.zoom;
    }
  }
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="map">
      {typeof mapBounds !== 'undefined' ? (
        <MemoizedGisidaLite
          layers={[...structures]}
          zoom={zoom}
          mapCenter={mapCenter}
          mapBounds={mapBounds}
          onMouseMoveHandler={buildMouseMoveHandler}
          // tslint:disable-next-line: jsx-no-lambda
          onClickHandler={onJurisdictionClick(props, setMapParent, history)}
        />
      ) : (
        <div>{MAP_LOAD_ERROR}</div>
      )}
    </div>
  );
};

AssignmentMapWrapper.defaultProps = defaultProps;

export { AssignmentMapWrapper };

/** Connect the component to the store */

/** Map state to props */
type MapStateToProps = Pick<
  AssignmentMapWrapperProps,
  | 'currentParentId'
  | 'rootJurisdictionId'
  | 'currentChildren'
  | 'getJurisdictionsFeatures'
  | 'currentParentNode'
  | 'getJurisdictionsMetadata'
>;

/** map action creators interface */
type DispatchToProps = Pick<
  AssignmentMapWrapperProps,
  | 'fetchJurisdictionsActionCreator'
  | 'fetchUpdatedCurrentParentActionCreator'
  | 'autoSelectNodesActionCreator'
  | 'deselectNodeCreator'
  | 'selectNodeCreator'
>;

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - the props
 */

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: AssignmentMapWrapperProps
): MapStateToProps => {
  const filters: Filters = {
    currentParentId: getMapCurrentParent(state).currentParentId.length
      ? getMapCurrentParent(state).currentParentId
      : ownProps.currentParentId,
    leafNodesOnly: true,
    planId: ownProps.plan.identifier,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  const childJurisdictions = getCurrentChildren()(state, filters);
  const jurisdictionFilters: JurisdictionGeomFilters = {
    currentChildren: childJurisdictions,
    filterGeom: true,
    jurisdictionId: getMapCurrentParent(state).currentParentId.length
      ? getMapCurrentParent(state).currentParentId
      : ownProps.currentParentId || ownProps.rootJurisdictionId,
    jurisdictionIdsArray:
      !ownProps.currentParentId && !getMapCurrentParent(state).currentParentId.length
        ? [ownProps.rootJurisdictionId]
        : childJurisdictions.map((node: TreeNode) => node.model.id),
    newFeatureProps: true,
    parentId:
      ownProps.currentParentId === ownProps.rootJurisdictionId ||
      getMapCurrentParent(state).currentParentId === ownProps.rootJurisdictionId ||
      !ownProps.currentParentId
        ? undefined
        : getMapCurrentParent(state).length
        ? getMapCurrentParent(state).currentParentId
        : ownProps.currentParentId || ownProps.rootJurisdictionId,
    planId: ownProps.plan.identifier,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  return {
    currentChildren: childJurisdictions,
    currentParentId: getMapCurrentParent(state).currentParentId.length
      ? getMapCurrentParent(state).currentParentId
      : ownProps.currentParentId,
    currentParentNode: getCurrentParentNode()(state, filters),
    getJurisdictionsFeatures: getJurisdictionsFC()(
      state,
      jurisdictionFilters,
      getJurisdictionsById(state, jurisdictionFilters)
    ),
    getJurisdictionsMetadata: getMetaData(state),
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps: DispatchToProps = {
  autoSelectNodesActionCreator: autoSelectNodes,
  deselectNodeCreator: deselectNode,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchUpdatedCurrentParentActionCreator: fetchUpdatedCurrentParent,
  selectNodeCreator: selectNode,
};

export const ConnectedAssignmentMapWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignmentMapWrapper);
