import React from 'react';
import { GeoJSONLayer } from 'react-mapbox-gl';
import { imgArr } from '../../../configs/settings';
import { MAIN_PLAN } from '../../../constants';
import { jurisdiction1 } from '../../../store/ducks/tests/fixtures';
import { gsLiteStyle, lineLayerTemplate } from '../helpers';
import { arePropsEqual, GisidaLiteProps } from '../index';

describe('components/GisidaLite/arePropsEqual', () => {
  it('returns false if layers length has changed', () => {
    const prevProps: GisidaLiteProps = {
      layers: [],
      mapCenter: [10, 10],
      mapHeight: '800px',
      mapIcons: imgArr,
      mapStyle: gsLiteStyle,
      mapWidth: '100%',
      scrollZoom: true,
      zoom: 17,
    };
    const nextProps: GisidaLiteProps = {
      ...prevProps,
      layers: [
        <GeoJSONLayer
          {...lineLayerTemplate}
          id={`${MAIN_PLAN}-${jurisdiction1.jurisdiction_id}`}
          data={jurisdiction1.geojson}
          key={`${MAIN_PLAN}-${jurisdiction1.jurisdiction_id}`}
        />,
      ],
    };
    expect(arePropsEqual(prevProps, nextProps)).toEqual(false);
  });

  it('returns true if length has not changed', () => {
    const prevProps: GisidaLiteProps = {
      layers: [],
      mapCenter: [10, 10],
      mapHeight: '800px',
      mapIcons: imgArr,
      mapStyle: gsLiteStyle,
      mapWidth: '100%',
      scrollZoom: true,
      zoom: 17,
    };
    const nextProps: GisidaLiteProps = {
      ...prevProps,
    };
    expect(arePropsEqual(prevProps, nextProps)).toEqual(true);
  });
});
