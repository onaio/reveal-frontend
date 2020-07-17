import { viewport } from '@mapbox/geo-viewport';
import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { FeatureCollection } from '@turf/turf';
import React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { CountriesAdmin0 } from '../../../../src/configs/settings';
import { MemoizedGisidaLite } from '../../../components/GisidaLite';
import Loading from '../../../components/page/Loading';
import { getJurisdictions } from '../../../components/TreeWalker/helpers';
import { displayError } from '../../../helpers/errors';
import { OpenSRPService } from '../../../services/opensrp';
import { Filters, getCurrentChildren } from '../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
import jurisdictionReducer, {
  fetchJurisdictions,
  Filters as JurisdictionGeomFilters,
  getJurisdictionsById,
  getJurisdictionsFC,
  reducerName as jurisdictionReducerName,
} from '../../../store/ducks/opensrp/jurisdictions';
import { buildStructureLayers } from '../FocusInvestigation/map/active/helpers/utils';
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** props for Plan jurisdiction and team assignment higher order component */
export interface AssignmentMapWrapperProps {
  // plan: PlanDefinition;
  rootJurisdictionId: string;
  currentParentId: string | undefined;
  currentChildren: TreeNode[];
  serviceClass: typeof OpenSRPService;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  getJurisdictionsFeatures: FeatureCollection;
}

const defaultProps = {
  currentChildren: [],
  currentParentId: undefined,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  getJurisdictionsFeatures: undefined,
  rootJurisdictionId: '',
  serviceClass: OpenSRPService,
};

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
              const getNode: any = currentChildren.find(
                node => node.model.id === val.id || node.parent.model.id === val.id
              );
              return {
                ...val,
                properties: {
                  ...val.properties,
                  fillColor:
                    getNode.model.meta && getNode.model.meta.selected ? '#f14423' : '#792b16',
                  fillOutlineColor:
                    getNode.model.meta && getNode.model.meta.selected ? '#22bcfb' : '#ffffff',
                  lineColor:
                    getNode.model.meta && getNode.model.meta.selected ? '#22bcfb' : '#ffffff',
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
  if (getJurisdictionsFeatures.features.length) {
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

  return typeof mapBounds !== 'undefined' ? (
    <div className="map">
      <MemoizedGisidaLite
        layers={[...structures]}
        zoom={zoom}
        mapCenter={mapCenter}
        mapBounds={mapBounds}
      />
    </div>
  ) : null;
};

AssignmentMapWrapper.defaultProps = defaultProps;

export { AssignmentMapWrapper };

/** Connect the component to the store */

/** Map state to props */
type MapStateToProps = Pick<
  AssignmentMapWrapperProps,
  'currentParentId' | 'rootJurisdictionId' | 'currentChildren' | 'getJurisdictionsFeatures'
>;

/** map action creators interface */
type DispatchToProps = Pick<AssignmentMapWrapperProps, 'fetchJurisdictionsActionCreator'>;

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
    leafNodesOnly: false,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  const childJurisdictions = getCurrentChildren()(state, filters);
  const jurisdictionFilters: JurisdictionGeomFilters = {
    filterGeom: false,
    jurisdictionId: ownProps.currentParentId || ownProps.rootJurisdictionId,
    jurisdictionIdsArray: !ownProps.currentParentId
      ? [ownProps.rootJurisdictionId]
      : childJurisdictions.map((node: TreeNode) => node.model.id),
    parentId:
      ownProps.currentParentId === ownProps.rootJurisdictionId
        ? undefined
        : ownProps.currentParentId || ownProps.rootJurisdictionId,
  };

  return {
    currentChildren: childJurisdictions,
    currentParentId: ownProps.currentParentId,
    getJurisdictionsFeatures: getJurisdictionsFC()(
      state,
      jurisdictionFilters,
      getJurisdictionsById(state, jurisdictionFilters)
    ),
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps: DispatchToProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
};

export const ConnectedAssignmentMapWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignmentMapWrapper);
