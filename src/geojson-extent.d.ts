declare module '@mapbox/geojson-extent' {
  import { Dictionary } from '@onaio/utils';
  /** Declare Type for GeojsonExtent return value */
  declare type Extent = number[] | null;
  /** Declare default function */
  export declare function GeojsonExtent(geojson: Dictionary) {
    return Extent;
  };
  /** Declare default function type */
  export type GeojsonExtent = typeof GeojsonExtent;
  export = GeojsonExtent;
}
