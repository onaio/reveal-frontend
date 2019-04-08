declare module 'gisida-react' {
  export interface MapProps {
    mapId: string;
    handlers: any[];
  }
  /** Gisida Map component */
  export declare class Map extends React.Component<MapProps, {}> {
    public render(): React.Component<any, any, any>;
  }
}
