import { OpenSRPJurisdiction } from '../types';

export const limitTree = [
  {
    jurisdiction_geographic_level: 1,
    jurisdiction_id: 'cec79f21-33c3-43f5-a8af-59a47aa61b84',
    jurisdiction_name: 'ra Luapula',
    jurisdiction_parent_id: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
    plan_id: 'aadc1c80-23f7-509e-9ca2-1172265c06b9',
  },
  {
    jurisdiction_geographic_level: 3,
    jurisdiction_id: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
    jurisdiction_name: 'ra Kashikishi HAHC',
    jurisdiction_parent_id: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
    plan_id: 'aadc1c80-23f7-509e-9ca2-1172265c06b9',
  },
  {
    jurisdiction_geographic_level: 2,
    jurisdiction_id: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
    jurisdiction_name: 'ra Nchelenge',
    jurisdiction_parent_id: 'cec79f21-33c3-43f5-a8af-59a47aa61b84',
    plan_id: 'aadc1c80-23f7-509e-9ca2-1172265c06b9',
  },
  {
    jurisdiction_geographic_level: 4,
    jurisdiction_id: 'fca0d71d-0410-45d3-8305-a9f092a150b8',
    jurisdiction_name: 'ra_ksh_2',
    jurisdiction_parent_id: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
    plan_id: 'aadc1c80-23f7-509e-9ca2-1172265c06b9',
  },
  {
    jurisdiction_geographic_level: 4,
    jurisdiction_id: 'xyz0d71d-0410-45d3-8305-a9f092a150b8',
    jurisdiction_name: 'ra_ksh_3',
    jurisdiction_parent_id: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
    plan_id: 'aadc1c80-23f7-509e-9ca2-1172265c06b9',
  },
  {
    jurisdiction_geographic_level: 0,
    jurisdiction_id: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
    jurisdiction_name: 'ra Zambia',
    jurisdiction_parent_id: '',
    plan_id: 'aadc1c80-23f7-509e-9ca2-1172265c06b9',
  },
];

export const raZambia: OpenSRPJurisdiction = {
  id: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
  properties: {
    code: '22bc44dd-752d-4c20-8761-617361b4f1e7',
    geographicLevel: 0,
    name: 'ra Zambia',
    status: 'Active',
    version: 0,
  },
  serverVersion: 1574076919370,
  type: 'Feature',
};

export const raLuapula: OpenSRPJurisdiction = {
  ...raZambia,
  id: limitTree[0].jurisdiction_id,
  properties: {
    ...raZambia.properties,
    geographicLevel: limitTree[0].jurisdiction_geographic_level,
    name: limitTree[0].jurisdiction_name,
    parentId: limitTree[0].jurisdiction_parent_id,
  },
};

export const raNchelenge: OpenSRPJurisdiction = {
  ...raZambia,
  id: limitTree[2].jurisdiction_id,
  properties: {
    ...raZambia.properties,
    geographicLevel: limitTree[2].jurisdiction_geographic_level,
    name: limitTree[2].jurisdiction_name,
    parentId: limitTree[2].jurisdiction_parent_id,
  },
};

export const raKashikishiHAHC: OpenSRPJurisdiction = {
  ...raZambia,
  id: limitTree[1].jurisdiction_id,
  properties: {
    ...raZambia.properties,
    geographicLevel: limitTree[1].jurisdiction_geographic_level,
    name: limitTree[1].jurisdiction_name,
    parentId: limitTree[1].jurisdiction_parent_id,
  },
};

export const raKsh2: OpenSRPJurisdiction = {
  ...raZambia,
  id: limitTree[3].jurisdiction_id,
  properties: {
    ...raZambia.properties,
    geographicLevel: limitTree[3].jurisdiction_geographic_level,
    name: limitTree[3].jurisdiction_name,
    parentId: limitTree[3].jurisdiction_parent_id,
  },
};

export const raKsh3: OpenSRPJurisdiction = {
  ...raZambia,
  id: limitTree[4].jurisdiction_id,
  properties: {
    ...raZambia.properties,
    geographicLevel: limitTree[4].jurisdiction_geographic_level,
    name: limitTree[4].jurisdiction_name,
    parentId: limitTree[4].jurisdiction_parent_id,
  },
};
