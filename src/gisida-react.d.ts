declare module 'gisida-react' {
  export interface Handler {
    method: (event: any) => false | void;
    name: string;
    type: string;
  }

  export interface MapProps {
    mapId: string;
    handlers: Handler[];
    store: any;
  }

  /** Gisida Map component */
  export declare class Map extends React.Component<MapProps, {}> {
    public render(): React.Component<any, any, any>;
  }
  /** create connected Spinner component */
  declare const Spinner: import('react-redux').ConnectedComponentClass;
}
