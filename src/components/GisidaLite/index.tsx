import { MemoizedGisidaLite } from '@onaio/gisida-lite';
import { isEqual } from 'lodash';
import { EventData, Style } from 'mapbox-gl';
import { Map } from 'mapbox-gl';
import React, { Fragment, useEffect } from 'react';
import { ZoomControl } from 'react-mapbox-gl';
import { FitBounds, Props } from 'react-mapbox-gl/lib/map';
import { Events } from 'react-mapbox-gl/lib/map-events';
import { GISIDA_MAPBOX_TOKEN } from '../../configs/env';
import { ERROR_LOADING_ITEMS } from '../../configs/lang';
import { imgArr } from '../../configs/settings';
import { ErrorPage } from '../page/ErrorPage';
import { gsLiteStyle } from './helpers';

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
  zoom?: number;
  mapIcons: MapIcon[];
  onClickHandler?: (map: Map, event: EventData) => void;
  onMouseMoveHandler?: (map: Map, event: EventData) => void;
  onLoad?: (map: Map) => void;
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
};

const mapBoxConfigs = {
  accessToken: GISIDA_MAPBOX_TOKEN,
  attributionControl: true,
  customAttribution: '&copy; Reveal',
  injectCSS: true,
};

/**
 * Really simple Gisida :)
 *
 * Inspired by the Map component in Akuko
 *
 * TODO: Add support for handlers and popups
 * TODO: Fix map jankiness
 */
const GisidaLiteWrapper = (props: GisidaLiteProps) => {
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
  } = props;

  const runAfterMapLoaded = React.useCallback(
    (map: Map) => {
      props.onLoad?.(map);
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

  if (mapCenter === undefined) {
    return <ErrorPage errorMessage={ERROR_LOADING_ITEMS} />;
  }

  /**
   * We want to make sure when layers GeoJSON change we set renderLayers to true
   */
  const onRender = (_: Map, __: React.SyntheticEvent<any>) => {
    if (!renderLayers) {
      setRenderLayers(true);
    }
  };

  let mapBoxProps: Props & Events = {
    center: mapCenter,
    containerStyle: {
      height: mapHeight,
      width: mapWidth,
    },
    fitBounds: mapBounds,
    onClick: onClickHandler,
    onMouseMove: onMouseMoveHandler,
    onRender,
    onStyleLoad: runAfterMapLoaded,
    style: mapStyle,
  };

  if (zoom) {
    mapBoxProps = { ...mapBoxProps, zoom: [zoom] };
  }

  return (
    <MemoizedGisidaLite
      reactMapboxGlConfigs={mapBoxConfigs}
      layers={
        renderLayers
          ? layers.map((item: any) => <Fragment key={`gsLite-${item.key}`}>{item}</Fragment>)
          : []
      }
      mapComponents={[<ZoomControl key="zoom-ctl" />]}
      mapConfigs={mapBoxProps}
    />
  );
};

GisidaLiteWrapper.defaultProps = gisidaLiteDefaultProps;

/**
 * Custom equality method for React.memo
 * @param prevProps
 * @param nextProps
 */
export const arePropsEqual = (prevProps: GisidaLiteProps, nextProps: GisidaLiteProps): boolean => {
  return isEqual(prevProps.layers, nextProps.layers);
};

const MemoizedGisidaLiteWrapper = React.memo(GisidaLiteWrapper, arePropsEqual);

export { GisidaLiteWrapper, MemoizedGisidaLiteWrapper };
