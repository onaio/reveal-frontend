import { Actions, prepareLayer } from 'gisida';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { AnyAction } from 'redux';

import GisidaWrapper from '../../../../../components/GisidaWrapper';
import { FlexObject, MapProps, RouteParams } from '../../../../../helpers/utils';
// import store from '../../../../../store';

/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<RouteComponentProps<RouteParams> & MapProps, {}> {
  constructor(props: RouteComponentProps<RouteParams> & MapProps) {
    super(props);
  }

  public render() {
    // const currentState = store.getState();
    const { id } = this.props.match.params;

    return (
      <div>
        <h2 className="page-title mt-4 mb-5">Map View: {id}</h2>
        <div className="map">
          <GisidaWrapper
            id={id}
            handlers={this.buildHandlers()}
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

export default SingleActiveFIMap;
