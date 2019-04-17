import reducerRegistry from '@onaio/redux-reducer-registry';
import { getStore } from '@onaio/redux-reducer-registry';
import { Actions, ducks, prepareLayer } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { AnyAction } from 'redux';

import { FlexObject, MapProps, RouteParams } from '../../../../../helpers/utils';
import reducer from '../../../../../store/ducks/users';

/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<RouteComponentProps<RouteParams> & MapProps, {}> {
  constructor(props: RouteComponentProps<RouteParams> & MapProps) {
    super(props);

    // todo - move this out of constructor
    const currentState = getStore(reducerRegistry.getReducers()).getState();
    const { dispatch } = getStore(reducerRegistry.getReducers());

    // A. Check for existing map reducers
    if (currentState['map-1']) {
      // 0. Dispatch Gisida actions to update map layers and position
    }
    // B. Start new Gisida Map component
    else {
      // 1. Register mapReducers in reducer registery;
      // todo - export reducers as modules from gisida
      reducerRegistry.register('APP', ducks.APP);
      reducerRegistry.register('map-1', ducks.MAP);

      // 2. Build/Load site-config js
      // const config = {
      //   "APP": {
      //     "mapConfig": {
      //       "container": "map",
      //       "style": "mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c",
      //       "center": [33.852072, -18.850944],
      //       "zoom": 6.5
      //     },
      //     "accessToken": "pk.eyJ1Ijoib25hIiwiYSI6IlVYbkdyclkifQ.0Bz-QOOXZZK01dq4MuMImQ",
      //     "apiAccessToken": "138a7ff6dfdcb5b4e41eb2d39bcc76ce5d296e89"
      //   },
      //   "LAYERS": ["https://raw.githubusercontent.com/onaio/cycloneidai-2019-data/master/moz/province-admin/province-admin.json"]
      // };

      // 3. Init App with config
      // dispatch(Actions.initApp(config));
    }
  }

  public render() {
    const currentState = getStore(reducerRegistry.getReducers()).getState();
    const doRenderMap = typeof currentState['map-1'] !== 'undefined';
    return (
      <div>
        <h2 className="page-title mt-4 mb-5">Map View</h2>
        {/* todo - update condition to render map */}
        {doRenderMap ? <Map mapId={'map-1'} handlers={this.buildHandlers()} /> : null}
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

  private loadLayers(mapId: string, layers: FlexObject[], dispatch: (action: AnyAction) => void) {
    let layer;
    if (Array.isArray(layers) && layers.length) {
      for (let l = 0; l < layers.length; l += 1) {
        layer = layers[l];
        this.loadLayerFunc(layer, l, mapId, dispatch);
      }
    }
  }

  private buildHandlers() {
    const { MAP } = this.props;
    const handlers = [
      {
        method: function drillDownClick(e: any) {
          if (e.originalEvent.shiftKey) {
            return false;
          }
          const features = e.target.queryRenderedFeatures(e.point);
          const feature = features.find((d: any) => d.layer.id === MAP.activeLayerId);
          if (e.target.getLayer('region-line') && e.target.getLayer(feature.layer.id)) {
            e.target.setFilter('region-line', [
              'any',
              ['==', 'ADM1_PCODE', feature.properties.ADM1_PCODE],
            ]);
          }
        },
        name: 'drillDownClick',
        type: 'click',
      },
      {
        method: function selectionClick(e: any) {
          if (!e.originalEvent.shiftKey) {
            return false;
          }
        },
        name: 'selectionClick',
        type: 'click',
      },
    ];
    return handlers;
  }
}

export default SingleActiveFIMap;
