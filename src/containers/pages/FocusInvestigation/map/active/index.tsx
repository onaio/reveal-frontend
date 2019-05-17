import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, prepareLayer } from 'gisida';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { AnyAction } from 'redux';
import { Store } from 'redux';
import GisidaWrapper from '../../../../../components/GisidaWrapper';
import { SUPERSET_GOALS_SLICE, SUPERSET_PLANS_SLICE } from '../../../../../configs/env';
import { FlexObject, MapProps, RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import geojsonReducer, {
  fetchGeoJSON,
  getGeoJSONs,
  reducerName as geojsonReducerName,
} from '../../../../../store/ducks/geojson';

reducerRegistry.register(geojsonReducerName, geojsonReducer);
// import store from '../../../../../store';

/** interface to describe props for ActiveFI component */
export interface MapSingleFIProps {
  fetchGoalsActionCreator: typeof fetchGeoJSON;
}

/** default props for ActiveFI component */
export const defaultSingleFIProps: MapSingleFIProps = {
  fetchGoalsActionCreator: fetchGeoJSON,
};
/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<RouteComponentProps<RouteParams> & MapProps, {}> {
  constructor(props: RouteComponentProps<RouteParams> & MapProps) {
    super(props);
  }

  public componentDidMount() {
    fetch('/config/data/opensrplocations.json') // todo - replace this with endpoint or connector
      .then(res => res.json())
      .then(data => {
        this.props.fetchGeoJSONActionCreator(data);
        // dispatch(Actions.);
      });
  }

  public render() {
    // const currentState = store.getState();
    const { id } = this.props.match.params;
    const { geoJSONData } = this.props;

    return (
      <div>
        <h2 className="page-title mt-4 mb-5">Map View: {id}</h2>
        <div className="map">
          <GisidaWrapper
            id={id}
            handlers={this.buildHandlers()}
            geoData={geoJSONData}
            // Location= {this.props.result.geoJSONData}
            // onInit={() => {console.log('map init')}}
          />
        </div>
      </div>
    );
  }

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
  const result = {
    geoJSONData: getGeoJSONs(state),
  };
  return result;
};

const mapDispatchToProps = {
  fetchGeoJSONActionCreator: fetchGeoJSON,
};
const ConnectedMapSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleActiveFIMap);

export default ConnectedMapSingleFI;
