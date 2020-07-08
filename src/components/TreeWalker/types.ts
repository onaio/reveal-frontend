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

/** Object containing known API endpoints by name */
export interface APIEndpoints {
  [key: string]: string;
}
