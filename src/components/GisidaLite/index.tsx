import { isEqual } from 'lodash';
import { EventData, Style } from 'mapbox-gl';
import { Map } from 'mapbox-gl';
import React, { Fragment, useEffect } from 'react';
import ReactMapboxGl, { ZoomControl } from 'react-mapbox-gl';
import { FitBounds } from 'react-mapbox-gl/lib/map';
import Loading from '../../components/page/Loading';
import { GISIDA_MAPBOX_TOKEN } from '../../configs/env';
import { imgArr } from '../../configs/settings';
import { gsLiteStyle } from './helpers';
import { TreeNode } from '../../store/ducks/opensrp/hierarchies/types';

/** single map icon description */
interface MapIcon {
  id: string;
  imageUrl: string;
}

/** interface for  GisidaLite props */
export interface GisidaLiteProps {
  layers: JSX.Element[];
  mapCenter: [number, number] | undefined;
  mapBounds?: FitBounds;
  mapHeight: string;
  mapStyle: Style | string;
  mapWidth: string;
  scrollZoom: boolean;
  zoom: number;
  mapIcons: MapIcon[];
  onClickHandler?: (map: Map, event: EventData) => void;
  onMouseMoveHandler?: (map: Map, event: EventData) => void;
  currentChildren: TreeNode[];
}

/** Default props for GisidaLite */
const gisidaLiteDefaultProps: GisidaLiteProps = {
  layers: [],
  mapCenter: undefined,
  mapHeight: '800px',
  mapIcons: imgArr,
  mapStyle: gsLiteStyle,
  mapWidth: '100%',
  scrollZoom: true,
  zoom: 17,
};

const Mapbox = ReactMapboxGl({
  accessToken: GISIDA_MAPBOX_TOKEN,
  attributionControl: true,
  customAttribution: '&copy; Reveal',
  injectCSS: true,
});

/**
 * Really simple Gisida :)
 *
 * Inspired by the Map component in Akuko
 *
 * TODO: Add support for handlers and popups
 * TODO: Fix map jankiness
 */
const GisidaLite = (props: GisidaLiteProps) => {
  const [renderLayers, setRenderLayers] = React.useState<boolean>(false);

  const {
    layers,
    mapCenter,
    mapHeight,
    mapWidth,
    mapStyle,
    mapIcons,
    onClickHandler,
    zoom,
    mapBounds,
    onMouseMoveHandler,
    currentChildren,
  } = props;

  if (mapCenter === undefined) {
    return <Loading />;
  }

  const runAfterMapLoaded = React.useCallback(
    (map: Map) => {
      if (mapIcons) {
        mapIcons.forEach(element => {
          map.loadImage(
            element.imageUrl,
            (
              _: Error,
              res:
                | HTMLImageElement
                | ArrayBufferView
                | { width: number; height: number; data: Uint8Array | Uint8ClampedArray }
                | ImageData
            ) => {
              map.addImage(element.id, res);
            }
          );
        });
      }
    },
    [mapIcons]
  );

  /**
   * Workaround to make sure each time props.layers change, we set renderLayers to false
   * so that we can re-create the map layers. The map jankiness solved by having the ReactMapboxGl
   * instance created outside the component to prevent new instances from being created when props change
   * introduced a bug where the layers stopped being rendered correctly.
   * For instance, some structures that were to be rendered with a fill of yellow were being rendered as green.
   * Symbol layers were not showing correctly. A race condition appears to be happening.
   * The bug fix is either to wait for all layers to be received before rendering the layers or
   * re-creating the map layers when props.layers change
   */
  useEffect(() => {
    if (renderLayers) {
      setRenderLayers(false);
    }
  }, [layers]);

  /**
   * We want to make sure when layers GeoJSON change we set renderLayers to true
   */
  const onRender = (_: Map, __: React.SyntheticEvent<any>) => {
    if (!renderLayers) {
      setRenderLayers(true);
    }
  };

  return (
    <Mapbox
      center={mapCenter}
      zoom={[zoom]}
      style={mapStyle}
      containerStyle={{
        height: mapHeight,
        width: mapWidth,
      }}
      fitBounds={mapBounds}
      onStyleLoad={runAfterMapLoaded}
      onClick={onClickHandler}
      onRender={onRender}
      onMouseMove={onMouseMoveHandler}
    >
      <>
        {renderLayers &&
          layers.map((item: any) => <Fragment key={`gsLite-${item.key}`}>{item}</Fragment>)}
        <ZoomControl />
      </>
    </Mapbox>
  );
};

GisidaLite.defaultProps = gisidaLiteDefaultProps;

/**
 * Custom equality method for React.memo
 * @param prevProps
 * @param nextProps
 */
export const arePropsEqual = (prevProps: GisidaLiteProps, nextProps: GisidaLiteProps): boolean => {
  return isEqual(prevProps.layers, nextProps.layers);
};

const MemoizedGisidaLite = React.memo(GisidaLite, arePropsEqual);

export { GisidaLite, MemoizedGisidaLite };
