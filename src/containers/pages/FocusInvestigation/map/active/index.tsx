import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers, prepareLayer } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { AnyAction } from 'redux';

import { FlexObject, MapProps, RouteParams } from '../../../../../helpers/utils';
import store from '../../../../../store';
import './gisida.css';

/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<RouteComponentProps<RouteParams> & MapProps, {}> {
  constructor(props: RouteComponentProps<RouteParams> & MapProps) {
    super(props);
    const initialState = store.getState();

    // // 1. Register mapReducers in reducer registery;
    if (!initialState.APP && ducks.APP) {
      reducerRegistry.register('APP', ducks.APP.default);
    }
    if (!initialState['map-1'] && ducks.MAP) {
      reducerRegistry.register('map-1', ducks.MAP.default);
    }

    // 2. Build/Load site-config js
    // todo - make this dynamically populated
    const config = {
      APP: {
        accessToken: 'pk.eyJ1Ijoib25hIiwiYSI6IlVYbkdyclkifQ.0Bz-QOOXZZK01dq4MuMImQ',
        apiAccessToken: '138a7ff6dfdcb5b4e41eb2d39bcc76ce5d296e89',
        appName: 'Test Map',
        mapConfig: {
          center: [33.852072, -18.850944],
          container: 'map',
          style: 'mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c',
          zoom: 6.5,
        },
      },
      LAYERS: [
        'https://raw.githubusercontent.com/onaio/cycloneidai-2019-data/master/moz/province-admin/province-admin.json',
      ],
    };

    // 3. Initialize Gisida stores
    store.dispatch(Actions.initApp(config.APP));
    loadLayers('map-1', store.dispatch, config.LAYERS);
  }

  public render() {
    const currentState = store.getState();
    const mapName = (currentState.APP && currentState.APP.appName) || '__';
    const doRenderMap = typeof currentState['map-1'] !== 'undefined';

    return (
      <div>
        <h2 className="page-title mt-4 mb-5">Map View: {mapName}</h2>
        <div className="map">
          {doRenderMap ? (
            <Map mapId={'map-1'} store={store} handlers={this.buildHandlers()} />
          ) : null}
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
