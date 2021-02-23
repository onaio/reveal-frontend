import { viewport } from '@mapbox/geo-viewport';
import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import { Feature, FeatureCollection, Geometry } from '@turf/turf';
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Store } from 'redux';
import { PlanDefinition } from '../../../../src/configs/settings';
import { MemoizedGisidaLite } from '../../../components/GisidaLite';
import Loading from '../../../components/page/Loading';
import { getJurisdictions } from '../../../components/TreeWalker/helpers';
import { INVALID_GEOMETRIES, JURISDICTION_NOT_FOUND, MAP_LOAD_ERROR } from '../../../configs/lang';
import { displayError } from '../../../helpers/errors';
import { OpenSRPService } from '../../../services/opensrp';
import {
  autoSelectNodes,
  deselectNode,
  Filters,
  getCurrentChildren,
  getCurrentParentNode,
  getMetaData,
  selectNode,
} from '../../../store/ducks/opensrp/hierarchies';
import { Meta, TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
import jurisdictionReducer, {
  fetchJurisdictions,
  Filters as JurisdictionGeomFilters,
  getJurisdictionsById,
  getJurisdictionsFC,
  reducerName as jurisdictionReducerName,
} from '../../../store/ducks/opensrp/jurisdictions';
import { buildStructureLayers } from '../FocusInvestigation/map/active/helpers/utils';
import { buildMouseMoveHandler, onJurisdictionClick } from './helpers/utils';

reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** props for Plan jurisdiction and team assignment higher order component */
export interface AssignmentMapWrapperProps {
  plan: PlanDefinition;
  rootJurisdictionId: string;
  currentParentId?: string;
  jurisdictionsChunkSize: number;
  getJurisdictionsMetadata: Dictionary<Dictionary<Dictionary<Meta>>>;
  currentChildren: TreeNode[];
  serviceClass: typeof OpenSRPService;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  getJurisdictionsFeatures: FeatureCollection;
  autoSelectNodesActionCreator: typeof autoSelectNodes;
  selectNodeCreator: typeof selectNode;
  deselectNodeCreator: typeof deselectNode;
  currentParentNode?: TreeNode;
  baseAssignmentURL: string;
  hideBottomBreadCrumbCallback: (showBreadcrumb: boolean) => void;
  matchFeatures?: boolean;
}

/** default value for feature Collection */
const defaultFeatureCollection: FeatureCollection = {
  features: [],
  type: 'FeatureCollection',
};

const defaultProps: AssignmentMapWrapperProps = {
  autoSelectNodesActionCreator: autoSelectNodes,
  baseAssignmentURL: '/',
  currentChildren: [],
  currentParentId: undefined,
  deselectNodeCreator: deselectNode,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  getJurisdictionsFeatures: defaultFeatureCollection,
  getJurisdictionsMetadata: {},
  hideBottomBreadCrumbCallback: () => {
    return;
  },
  jurisdictionsChunkSize: 30,
  plan: {
    identifier: '',
  } as PlanDefinition,
  rootJurisdictionId: '',
  selectNodeCreator: selectNode,
  serviceClass: OpenSRPService,
};

/**
 * This is a map HOC for the plan and jurisdiction assignment pages
 * It is responsible for fetching jurisdiction geojson and wiring down to
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
    jurisdictionsChunkSize,
    hideBottomBreadCrumbCallback,
  } = props;
  const currentChildIds: string[] = currentChildren.map(node => node.model.id);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [mapParent, setMapParent] = React.useState<string>('');
  const [hasValidGeoms, setHasValidGeoms] = React.useState<boolean>(true);
  const history = useHistory();

  React.useEffect(() => {
    // invalid geoms handler
    let hasValidGeomsBool = true;
    const getCoordinates = (coordinates: any) => {
      if (coordinates && Array.isArray(coordinates)) {
        getCoordinates((coordinates as any)[0]);
      } else if (typeof coordinates === 'undefined') {
        hasValidGeomsBool = false;
      }
    };
    const mapFeatures = (feature: Feature) => {
      if ((feature.geometry as Geometry).coordinates.length) {
        (feature.geometry as Geometry).coordinates.forEach(getCoordinates);
      }
    };
    if (!getJurisdictionsFeatures.features.length) {
      setLoading(true);
      const params = {
        is_jurisdiction: true,
        return_geometry: true,
      };
      getJurisdictions(
        !currentParentId ? [rootJurisdictionId] : currentChildIds,
        params,
        jurisdictionsChunkSize,
        serviceClass
      )
        .then(res => {
          if (res.value && res.value.length && currentChildren.length) {
            (res.value as Feature[]).forEach(mapFeatures);
            if (hasValidGeomsBool) {
              fetchJurisdictionsActionCreator(res.value);
            } else {
              displayError(new Error(INVALID_GEOMETRIES));
            }
            setLoading(false);
            setHasValidGeoms(hasValidGeomsBool);
            hideBottomBreadCrumbCallback(!hasValidGeomsBool);
          } else {
            setLoading(false);
            setHasValidGeoms(false);
            hideBottomBreadCrumbCallback(true);
            displayError(new Error(JURISDICTION_NOT_FOUND));
          }
        })
        .finally(() => {
          setLoading(false);
        })
        .catch(error => displayError(error));
    } else {
      getJurisdictionsFeatures.features.forEach(mapFeatures);
      setLoading(false);
      setHasValidGeoms(hasValidGeomsBool);
      hideBottomBreadCrumbCallback(!hasValidGeomsBool);
    }
  }, [getJurisdictionsFeatures, currentParentId]);

  React.useEffect(() => {
    if (mapParent.length) {
      fetchJurisdictionsActionCreator(getJurisdictionsFeatures.features as any);
      onJurisdictionClick(props, setMapParent, history);
      setMapParent('');
    }
  }, [getJurisdictionsFeatures, mapParent]);

  let structures: JSX.Element[] = [];
  let mapCenter;
  let mapBounds;
  let zoom;
  if (getJurisdictionsFeatures && getJurisdictionsFeatures.features.length) {
    structures = buildStructureLayers(getJurisdictionsFeatures as any, true);
    mapBounds = GeojsonExtent(getJurisdictionsFeatures);
    // get map zoom and center values
    const centerAndZoom = viewport(mapBounds, [600, 400]);
    mapCenter = centerAndZoom.center;
    zoom = centerAndZoom.zoom;
  }

  if (loading) {
    return <Loading />;
  }

  if (!hasValidGeoms || !structures.length || !mapBounds || !zoom) {
    return <div>{MAP_LOAD_ERROR}</div>;
  }

  return (
    <div className="map">
      <MemoizedGisidaLite
        layers={[...structures]}
        zoom={zoom}
        mapCenter={mapCenter}
        mapBounds={mapBounds}
        onMouseMoveHandler={buildMouseMoveHandler}
        // tslint:disable-next-line: jsx-no-lambda
        onClickHandler={onJurisdictionClick(props, setMapParent, history)}
      />
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
    currentParentId: ownProps.currentParentId,
    leafNodesOnly: true,
    planId: ownProps.plan.identifier,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  const childJurisdictions = getCurrentChildren()(state, filters);
  const jurisdictionFilters: JurisdictionGeomFilters = {
    currentChildren: childJurisdictions,
    filterGeom: true,
    jurisdictionId: ownProps.currentParentId || ownProps.rootJurisdictionId,
    jurisdictionIdsArray: !ownProps.currentParentId
      ? [ownProps.rootJurisdictionId]
      : childJurisdictions.map((node: TreeNode) => node.model.id),
    matchFeatures: ownProps.matchFeatures,
    newFeatureProps: true,
    parentId:
      ownProps.currentParentId === ownProps.rootJurisdictionId || !ownProps.currentParentId
        ? undefined
        : ownProps.currentParentId || ownProps.rootJurisdictionId,
    planId: ownProps.plan.identifier,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  return {
    currentChildren: childJurisdictions,
    currentParentId: ownProps.currentParentId,
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
  selectNodeCreator: selectNode,
};

export const ConnectedAssignmentMapWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignmentMapWrapper);
