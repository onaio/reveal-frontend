declare module '@onaio/superset-connector' {
  /** interface to describe config */
  export interface SupersetConfig {
    base?: string;
    credentials?: string;
    endpoint: string;
    extraPath: string;
    method?: string;
    mimeType?: string;
    token?: string;
  }

  /** interface to describe superset object */
  export interface Superset {
    api: any;
    authZ: any;
    deAuthZ: any;
    processData: any;
  }

  /** The main superset object */
  declare const superset: Superset;
  export default superset;
}
