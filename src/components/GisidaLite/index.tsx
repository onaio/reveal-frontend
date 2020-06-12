import React, { Fragment } from 'react';
import ReactMapboxGl, { ZoomControl } from 'react-mapbox-gl';
import Loading from '../../components/page/Loading';
import { GISIDA_MAPBOX_TOKEN } from '../../configs/env';

/** interface for  GisidaLite props */
interface GisidaLiteProps {
  accessToken: string;
  attributionControl: boolean;
  customAttribution: string;
  injectCSS: boolean;
  layers: any; // TODO: type this correctly
  mapCenter: [number, number] | undefined;
  mapHeight: string;
  mapStyle: string;
  mapWidth: string;
  scrollZoom: boolean;
  zoom: number;
}

/** Default props for GisidaLite */
const gisidaLiteDefaultProps: GisidaLiteProps = {
  accessToken: GISIDA_MAPBOX_TOKEN,
  attributionControl: true,
  customAttribution: '&copy; Reveal',
  injectCSS: true,
  layers: [],
  mapCenter: undefined,
  mapHeight: '60vh', // what is the correct default height?
  mapStyle: 'mapbox://styles/mapbox/satellite-v9', // is this the right one?
  mapWidth: '100%',
  scrollZoom: false,
  zoom: 15, // what's the default zoom level we use right now?
};

/**
 * Really simple Gisida :)
 *
 * Inspired by the Map component in Akuko
 *
 * TODO: Add support for handlers and popups
 * TODO: Fix map jankiness
 */
const GisidaLite = (props: GisidaLiteProps) => {
  const [renderlayers, setRenderLayers] = React.useState<boolean>(false);
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
    zoom,
  } = props;

  const Map = ReactMapboxGl({
    accessToken,
    attributionControl,
    customAttribution,
    injectCSS,
    scrollZoom,
  });

  if (mapCenter === undefined) {
    return <Loading />;
  }

  const runAfterMapLoaded = () => {
    if (!renderlayers) {
      setRenderLayers(true);
    }
  };

  return (
    <Fragment>
      {/* TODO: figure out how to use digital globe  */}
      <Map
        center={mapCenter}
        zoom={[zoom]}
        style={mapStyle}
        containerStyle={{
          height: mapHeight,
          width: mapWidth,
        }}
        onStyleLoad={runAfterMapLoaded}
      >
        {renderlayers &&
          layers.map((item: any, index: number) => <Fragment key={index}>{item}</Fragment>)}
        {/* TODO: figure out why removing this comment raises type errors */}
        <ZoomControl />
      </Map>
    </Fragment>
  );
};

GisidaLite.defaultProps = gisidaLiteDefaultProps;

export { GisidaLite };
