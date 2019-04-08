declare module 'gisida-react' {
  export interface Handler {
    method: (event: any) => false | void;
    name: string;
    type: string;
  }

  export interface MapProps {
    mapId: string;
    handlers: Handler[];
  }
  /** Gisida Map component */
  export declare class Map extends React.Component<MapProps, {}> {
    public render(): React.Component<any, any, any>;
  }
}
