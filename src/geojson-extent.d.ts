declare module '@mapbox/geojson-extent' {
  interface FlexObject {
    [key: string]: any;
  }
  /** Declare Type for GeojsonExtent return value */
  declare type Extent = number[] | null;
  /** Declare default function */
  export declare function GeojsonExtent(geojson: FlexObject) {
    return Extent;
  };
  /** Declare default function type */
  export type GeojsonExtent = typeof GeojsonExtent;
  export = GeojsonExtent;
}
