import { any, number } from 'prop-types';

declare module '@mapbox/geojson-extent' {
  interface FlexObject {
    [key: string]: any;
  }

  declare type Extent = number[] | null;
  export declare function GeojsonExtent(geojson: FlexObject) {
    return Extent;
  };
  export type GeojsonExtent = typeof GeojsonExtent;
}
