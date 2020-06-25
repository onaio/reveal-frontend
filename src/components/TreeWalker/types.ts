/** The shape of a jurisdiction received from the OpenSRP API */
export interface OpenSRPJurisdiction {
  id: string;
  properties: {
    code?: string;
    geographicLevel: number;
    name: string;
    parentId?: string;
    status: string;
    version: string | number;
  };
  serverVersion: number;
  type: 'Feature';
}

/** Used to describe OpenSRP jurisdictions in short form */
export interface SimpleJurisdiction {
  jurisdiction_id: string;
  jurisdiction_parent_id: string;
}

/** Object containing known API endpoints by name */
export interface APIEndpoints {
  [key: string]: string;
}
