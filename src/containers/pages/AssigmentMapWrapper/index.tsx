import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { FeatureCollection } from '@turf/turf';
import React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { CountriesAdmin0 } from '../../../../src/configs/settings';
import { GisidaLite } from '../../../components/GisidaLite';
import { getCenter } from '../../../components/GisidaLite/helpers';
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
  } = props;
  const currentChildIds: string[] = currentChildren.map(node => node.model.id);
  const [loading, setLoading] = React.useState(true);
  const collection: any = getJurisdictionsFeatures.features;
  const collectionIds: string[] = collection.map((c: any) => c.id);
  const jurisdictionLabels = currentChildren.map(d => d.model.label);
  React.useEffect(() => {
    if (!currentChildIds.filter(cc => collectionIds.includes(cc)).length) {
      setLoading(true);
      const params = {
        is_jurisdiction: true,
        return_geometry: true,
      };
      getJurisdictions(currentChildIds, params, 30, serviceClass)
        .then(res => {
          if (res.value && res.value.length) {
            fetchJurisdictionsActionCreator(res.value);
          }
        })
        .finally(() => {
          setLoading(false);
        })
        .catch(error => displayError(error));
    }
  }, [currentChildIds]);
  let structures: JSX.Element[] = [];
  let mapCenter;
  let mapBounds;
  if (getJurisdictionsFeatures.features.length) {
    structures = buildStructureLayers(getJurisdictionsFeatures as any, true);
    if (Object.keys(CountriesAdmin0).filter(admin => jurisdictionLabels.includes(admin)).length) {
      mapCenter = undefined;
      mapBounds = undefined;
    } else {
      mapCenter = getCenter(getJurisdictionsFeatures);
      mapBounds = GeojsonExtent(getJurisdictionsFeatures);
    }
  }
  if (loading) {
    return <Loading />;
  }
  return (
    <div className="map">
      {!loading && typeof mapCenter !== 'undefined' ? (
        <GisidaLite layers={[...structures]} mapCenter={mapCenter} mapBounds={mapBounds} />
      ) : null}
    </div>
  );
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
    leafNodesOnly: true,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  const childJurisdictions = getCurrentChildren()(state, filters);

  const jurisdictionFilters: JurisdictionGeomFilters = {
    filterGeom: false,
    jurisdictionId: ownProps.currentParentId || ownProps.rootJurisdictionId,
    jurisdictionIdsArray: childJurisdictions.map((node: TreeNode) => node.model.id),
    parentId: ownProps.currentParentId,
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
