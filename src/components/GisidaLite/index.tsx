import { Style } from 'mapbox-gl';
import { Map } from 'mapbox-gl';
import React, { Fragment } from 'react';
import ReactMapboxGl, { ZoomControl } from 'react-mapbox-gl';
import { FitBounds } from 'react-mapbox-gl/lib/map';
import Loading from '../../components/page/Loading';
import { GISIDA_MAPBOX_TOKEN } from '../../configs/env';
import { gsLiteStyle } from './helpers';

/** interface for  GisidaLite props */
interface GisidaLiteProps {
  accessToken: string;
  attributionControl: boolean;
  customAttribution: string;
  injectCSS: boolean;
  layers: any[];
  mapCenter: [number, number] | undefined;
  mapBounds?: FitBounds;
  mapHeight: string;
  mapStyle: Style | string;
  mapWidth: string;
  scrollZoom: boolean;
  zoom: number;
  onClickHandler?: (map: Map, event: any) => void;
}

/** Default props for GisidaLite */
const gisidaLiteDefaultProps: GisidaLiteProps = {
  accessToken: GISIDA_MAPBOX_TOKEN,
  attributionControl: true,
  customAttribution: '&copy; Reveal',
  injectCSS: true,
  layers: [],
  mapCenter: undefined,
  mapHeight: '800px',
  mapStyle: gsLiteStyle,
  mapWidth: '100%',
  scrollZoom: true,
  zoom: 16,
};

const Mapbox = ReactMapboxGl({
  accessToken: GISIDA_MAPBOX_TOKEN,
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
    accessToken,
    attributionControl,
    customAttribution,
    injectCSS,
    layers,
    mapCenter,
    mapHeight,
    mapWidth,
    mapStyle,
    scrollZoom,
    onClickHandler,
    zoom,
  } = props;

  if (mapCenter === undefined) {
    return <Loading />;
  }

  const runAfterMapLoaded = () => {
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
      fitBounds={props.mapBounds}
      onStyleLoad={runAfterMapLoaded}
      onClick={onClickHandler}
    >
      <>
        {renderLayers &&
          layers.map((item: any, index: number) => (
            <Fragment key={`gsLite-${index}`}>{item}</Fragment>
          ))}
        {/* {renderLayers &&
          layers.map((item: any, index: number) => {
            return <GeoJSONLayer {...item} key={`gs-layers-${index}`} />;
          })} */}
        <ZoomControl />
      </>
    </Mapbox>
  );
};

GisidaLite.defaultProps = gisidaLiteDefaultProps;

export { GisidaLite };
