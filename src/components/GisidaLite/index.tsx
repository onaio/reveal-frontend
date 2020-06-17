import { Style } from 'mapbox-gl';
import React, { Fragment } from 'react';
import ReactMapboxGl, { ZoomControl } from 'react-mapbox-gl';
import Loading from '../../components/page/Loading';
import { GISIDA_MAPBOX_TOKEN } from '../../configs/env';
import { gsLiteStyle } from './helpers';

/** interface for  GisidaLite props */
interface GisidaLiteProps {
  accessToken: string;
  attributionControl: boolean;
  customAttribution: string;
  injectCSS: boolean;
  layers: JSX.Element[];
  mapCenter: [number, number] | undefined;
  mapHeight: string;
  mapStyle: Style | string;
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
  mapHeight: '800px',
  mapStyle: gsLiteStyle,
  mapWidth: '100%',
  scrollZoom: true,
  zoom: 15,
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
    if (!renderLayers) {
      setRenderLayers(true);
    }
  };

  return (
    <Fragment>
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
        <>
          {renderLayers &&
            layers.map((item: any, index: number) => (
              <Fragment key={`gsLite-${index}`}>{item}</Fragment>
            ))}
          <ZoomControl />
        </>
      </Map>
    </Fragment>
  );
};

GisidaLite.defaultProps = gisidaLiteDefaultProps;

export { GisidaLite };
