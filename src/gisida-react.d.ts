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
  // export interface SpinnerProps {
  //   mapId: string;
  //   Map
  // }
  /** Gisida Map component */
  export declare class Map extends React.Component<MapProps, {}> {
    public render(): React.Component<any, any, any>;
  }
  /** Gisida Spinner Component */
  // tslint:disable-next-line:max-classes-per-file
  export declare class Spinner extends React.Component<any, {}> {
    public render(): React.Component<any, any, any>;
  }
}
