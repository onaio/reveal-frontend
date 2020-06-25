/** utils for the jurisdiction selection table  */
import { Dictionary } from '@onaio/utils';
import { cloneDeep } from 'lodash';
import TreeModel from 'tree-model';

/** inline data store to store hierarchical jurisdictions data */
export const tree = new TreeModel();

export const generateJurisdictionTree = (apiResponse: any) => {
  // keep reference to jurisdiction tree, give back a few helper functions (facade)
  // to return the jurisdiction tree info manipulated in a few ways.
  const hierarchy: any = parseHierarchy(apiResponse);
  const root = tree.parse(hierarchy);
  return root;
};

const parseChildren = (map: any) => {
  if (map.children) {
    map.children = Object.entries(map.children).map(([key, value]) => value);
    map.children.forEach((child: any) => {
      parseChildren(child);
    });
  }
};

const parseParent = (map: any) => {
  const parentJurisdiction = Object.entries(map).map(([key, value]) => value)[0];
  return parentJurisdiction;
};

// locationsTree
const parseHierarchy = (locationsTree: any) => {
  // clone the locationTree, to avoid sideEffects
  const locationsTreeClone = cloneDeep(locationsTree);
  // assumption here: locationsTreeClone has a single object under map, i.e there is only one root jurisdiction
  const { map } = locationsTreeClone.locationsHierarchy;
  const parentJurisdiction = Object.entries(map).map(([key, value]) => value)[0];
  const rootJurisdiction = parseParent(locationsTreeClone);
  parseChildren(rootJurisdiction);
  return parentJurisdiction;
};

export interface HierarchySingleNodeAttributes extends Dictionary<string | number | undefined> {
  geographicLevel: number;
  structureCount?: number;
}

export interface RawHierarchySingleNode {
  [id: string]: {
    id: string;
    label: string;
    node: {
      locationId: string;
      name: string;
      attributes: HierarchySingleNodeAttributes;
      voided: boolean;
    };
    children: RawHierarchySingleNode;
    parent?: string;
  };
}

export interface RawOpenSRPHierarchy {
  locationsHierarchy: {
    map: RawHierarchySingleNode;
    parentChildren: Dictionary<string[]>;
  };
}
