export interface OpenSRPJurisdiction {
  id: string;
  properties: {
    status: string;
    name: string;
    geographicLevel: number;
    parentId?: string;
    version: string | number;
  };
  serverVersion: number;
  type: 'Feature';
}
