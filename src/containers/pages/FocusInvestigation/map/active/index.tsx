import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, prepareLayer } from 'gisida';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { AnyAction } from 'redux';
import { Store } from 'redux';
import GisidaWrapper from '../../../../../components/GisidaWrapper';
import { SUPERSET_JURISDICTIONS_SLICE } from '../../../../../configs/env';
import { FlexObject, MapProps, RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import geojsonReducer, {
  fetchGeoJSON,
  GeoJSON,
  getGeoJSONs,
  reducerName as geojsonReducerName,
} from '../../../../../store/ducks/jurisdictions';
import { plan1, singleGeoJSON } from '../../../../../store/ducks/tests/fixtures';

import plansReducer, {
  getPlanById,
  Plan,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

reducerRegistry.register(geojsonReducerName, geojsonReducer);
reducerRegistry.register(plansReducerName, plansReducer);
// import store from '../../../../../store';

/** interface to describe props for ActiveFI component */
export interface MapSingleFIProps {
  fetchGeoJSONActionCreator: typeof fetchGeoJSON;
  geoJSONData: GeoJSON | null;
  plan: Plan | null;
}

/** default props for ActiveFI component */
export const defaultMapSingleFIProps: MapSingleFIProps = {
  fetchGeoJSONActionCreator: fetchGeoJSON,
  geoJSONData: singleGeoJSON,
  plan: plan1,
};
/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<
  RouteComponentProps<RouteParams> & MapSingleFIProps,
  FlexObject
> {
  public static defaultProps = defaultMapSingleFIProps;
  constructor(props: RouteComponentProps<RouteParams> & MapSingleFIProps) {
    super(props);
  }

  public async componentDidMount() {
    const { fetchGeoJSONActionCreator } = this.props;
    await supersetFetch(SUPERSET_JURISDICTIONS_SLICE).then((result: GeoJSON[]) =>
      fetchGeoJSONActionCreator(result)
    );
  }
  public render() {
    // const currentState = store.getState();
    // id represents planid
    const { geoJSONData, plan } = this.props;

    return (
      <div>
        <h2 className="page-title mt-4 mb-5">
          Map View: {plan && plan.jurisdiction_name ? plan.jurisdiction_name : null}
        </h2>
        <div className="map">
          <GisidaWrapper
            handlers={this.buildHandlers()}
            geoData={geoJSONData}
            // Location= {this.props.result.geoJSONData}
            // onInit={() => {console.log('map init')}}
          />
        </div>
      </div>
    );
  }
  // not sure where this should be called
  private loadLayerFunc(
    resObj: FlexObject,
    layerId: number,
    mapId: string,
    dispatch: (action: AnyAction) => void
  ): void {
    const layerObj = { ...resObj };
    layerObj.id = layerId;
    layerObj.loaded = false;
    dispatch(Actions.addLayer(mapId, layerObj));
    if (layerObj.visible && !layerObj.loaded) {
      prepareLayer(mapId, layerObj, dispatch);
    }
  }

  private buildHandlers() {
    const self = this;
    const handlers = [
      {
        method: function drillDownClick(e: any) {
          // if (e.originalEvent.shiftKey) {
          //   return false;
          // }
          const features = e.target.queryRenderedFeatures(e.point);
          if (features[0] && Number(features[0].id) !== Number(self.props.match.params.id)) {
            self.props.history.push(`/focus-investigation/map/${features[0].id}`);
          }
        },
        name: 'drillDownClick',
        type: 'click',
      },
      // {
      //   method: function selectionClick(e: any) {
      //     if (!e.originalEvent.shiftKey) {
      //       return false;
      //     }
      //   },
      //   name: 'selectionClick',
      //   type: 'click',
      // },
    ];
    return handlers;
  }
}
/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any) => {
  // pass in the plan id to get plan the get the jurisdicytion_id from the plan
  const plan = getPlanById(state, ownProps.match.params.id);
  let geoJSONData = null;
  if (plan) {
    geoJSONData = getGeoJSONs(state, plan.jurisdiction_id);
  }
  return {
    geoJSONData,
    plan,
  };
};

const mapDispatchToProps = {
  fetchGeoJSONActionCreator: fetchGeoJSON,
};
const ConnectedMapSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleActiveFIMap);

export default ConnectedMapSingleFI;
