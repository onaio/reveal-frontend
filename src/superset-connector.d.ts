declare module '@onaio/superset-connector' {
  /** interface to describe config */
  export interface SupersetConfig {
    base?: string;
    credentials?: string;
    endpoint: string;
    extraPath: string;
    method?: string;
    mimeType?: string;
    params?: string;
    provider?: string;
    token?: string;
  }

  declare class API {
    public doFetch(config: SupersetConfig, middleware: (e: any) => e) {
      return any;
    }
  }

  /** interface to describe superset object */
  export interface Superset {
    api: API;
    authZ: any;
    deAuthZ: any;
    processData: any;
  }

  /** The main superset object */
  declare const superset: Superset;
  export default superset;
}
