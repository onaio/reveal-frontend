import { viewport } from '@mapbox/geo-viewport';
import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { FeatureCollection } from '@turf/turf';
import React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { EventData, Map } from 'mapbox-gl';
import { Dictionary } from '@onaio/utils';
import { CountriesAdmin0 } from '../../../../src/configs/settings';
import { MemoizedGisidaLite } from '../../../components/GisidaLite';
import Loading from '../../../components/page/Loading';
import { getJurisdictions } from '../../../components/TreeWalker/helpers';
import { MAP_LOAD_ERROR } from '../../../configs/lang';
import { displayError } from '../../../helpers/errors';
import { OpenSRPService } from '../../../services/opensrp';
import {
  Filters,
  getCurrentChildren,
  fetchUpdatedCurrentParentId,
  getMapCurrentParentId,
} from '../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
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
  rootJurisdictionId: string;
  currentParentId: string | undefined;
  currentChildren: TreeNode[];
  serviceClass: typeof OpenSRPService;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchUpdatedCurrentParentIdActionCreator: typeof fetchUpdatedCurrentParentId;
  getJurisdictionsFeatures: FeatureCollection;
  currentState: any;
  mapCurrentParentId: string;
}

const defaultProps = {
  currentChildren: [],
  currentParentId: undefined,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchUpdatedCurrentParentIdActionCreator: fetchUpdatedCurrentParentId,
  getJurisdictionsFeatures: undefined,
  rootJurisdictionId: '',
  serviceClass: OpenSRPService,
  currentState: {},
  mapCurrentParentId: '',
};

export const onJurisdictionClick = (map: Map, e: EventData, props: any, state: any) => {
  // Destructure event data
  const { point, originalEvent, target } = e;
  const { fetchUpdatedCurrentParentIdActionCreator } = props;
  // grab underlying features from map
  const features: any = target.queryRenderedFeatures(point) as Dictionary[];
  if (!features.length) {
    return false;
  }
  if (features[0]) {
    fetchUpdatedCurrentParentIdActionCreator(
      (features[0].id && features[0].id.toString()) ||
        (features[0] && features[0].properties && features[0].properties.externalId) ||
        ''
    );
  }
};

const AssignmentMapWrapper = (props: AssignmentMapWrapperProps) => {
  const {
    serviceClass,
    currentChildren,
    fetchJurisdictionsActionCreator,
    getJurisdictionsFeatures,
    currentParentId,
    rootJurisdictionId,
    currentState,
  } = props;
  const currentChildIds: string[] = currentChildren.length
    ? currentChildren.map(node => node.model.id)
    : [];
  const [loading, setLoading] = React.useState(true);
  const jurisdictionLabels = currentChildren.map(d => d.model.label);
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
            const newCollection = res.value.map(val => {
              const getNode: TreeNode | any = currentChildren.find(
                node => node.model.id === val.id || node.parent.model.id === val.id
              );
              return {
                ...val,
                properties: {
                  ...val.properties,
                  fillColor: nodeIsSelected(getNode) ? '#f14423' : '#792b16',
                  fillOutlineColor: nodeIsSelected(getNode) ? '#22bcfb' : '#ffffff',
                  lineColor: nodeIsSelected(getNode) ? '#22bcfb' : '#ffffff',
                },
              };
            });
            fetchJurisdictionsActionCreator(newCollection);
          }
        })
        .finally(() => {
          setLoading(false);
        })
        .catch(error => displayError(error));
    }
  }, [getJurisdictionsFeatures, currentParentId]);
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
          onClickHandler={(map, e) => onJurisdictionClick(map, e, props, currentState)}
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
  | 'currentState'
  | 'mapCurrentParentId'
>;

/** map action creators interface */
type DispatchToProps = Pick<
  AssignmentMapWrapperProps,
  'fetchJurisdictionsActionCreator' | 'fetchUpdatedCurrentParentIdActionCreator'
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
    currentParentId: getMapCurrentParentId(state).length
      ? getMapCurrentParentId(state)
      : ownProps.currentParentId,
    leafNodesOnly: true,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  const childJurisdictions = getCurrentChildren()(state, filters);
  const jurisdictionFilters: JurisdictionGeomFilters = {
    filterGeom: true,
    jurisdictionId: getMapCurrentParentId(state).length
      ? getMapCurrentParentId(state)
      : ownProps.currentParentId || ownProps.rootJurisdictionId,
    jurisdictionIdsArray: !ownProps.currentParentId
      ? getMapCurrentParentId(state).length
        ? [getMapCurrentParentId(state)]
        : [ownProps.rootJurisdictionId]
      : childJurisdictions.map((node: TreeNode) => node.model.id),
    parentId:
      ownProps.currentParentId === ownProps.rootJurisdictionId ||
      getMapCurrentParentId(state) === ownProps.rootJurisdictionId ||
      !ownProps.currentParentId
        ? undefined
        : getMapCurrentParentId(state).length
        ? getMapCurrentParentId(state)
        : ownProps.currentParentId || ownProps.rootJurisdictionId,
  };

  console.log(
    'childern from map>>',
    getCurrentChildren()(state, {
      ...filters,
      currentParentId: getMapCurrentParentId(state),
    })
  );

  return {
    currentChildren: childJurisdictions,
    currentParentId: getMapCurrentParentId(state).length
      ? getMapCurrentParentId(state)
      : ownProps.currentParentId,
    getJurisdictionsFeatures: getJurisdictionsFC()(
      state,
      jurisdictionFilters,
      getJurisdictionsById(state, jurisdictionFilters)
    ),
    rootJurisdictionId: ownProps.rootJurisdictionId,
    currentState: state,
    mapCurrentParentId: getMapCurrentParentId(state),
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps: DispatchToProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchUpdatedCurrentParentIdActionCreator: fetchUpdatedCurrentParentId,
};

export const ConnectedAssignmentMapWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignmentMapWrapper);
