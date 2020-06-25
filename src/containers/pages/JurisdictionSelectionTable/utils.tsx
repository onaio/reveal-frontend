/** utils for the jurisdiction selection table  */
import { Dictionary } from '@onaio/utils';
import { cloneDeep } from 'lodash';
import TreeModel from 'tree-model';

/** inline data store to store hierarchical jurisdictions data */
export const tree = new TreeModel();

/** mutates the structure of the children property in a single node
 * @param {RawHierarchySingleNode} rawSingleNode - single node i.e. part of rawOpensrp hierarchy
 */
const parseChildren = (rawSingleNode: RawHierarchySingleNode) => {
  // explicitly dictating the types since we are mutating the object to a diff structure.
  const typedRawSingleNode = (rawSingleNode as unknown) as ParsedHierarchySingleNode;
  if (typedRawSingleNode.children) {
    typedRawSingleNode.children = Object.entries(typedRawSingleNode.children).map(
      ([_, value]) => value
    );
    typedRawSingleNode.children.forEach(child => {
      const typedChild = (child as unknown) as RawHierarchySingleNode;
      parseChildren(typedChild);
    });
  }
};

/** extract the root node as a flat object
 * @param {RawOpenSRPHierarchy} map - value of map in the rawOpenSRPHierarchy
 */
const parseParent = (map: RawHierarchySingleNodeMap) => {
  const parentJurisdiction = Object.entries(map).map(([_, value]) => value)[0];
  return parentJurisdiction;
};

/** parses the raw opensrp hierarchy to a hierarchy that we can quickly build
 * our tree model from.
 * @param {RawOpenSRPHierarchy} rawOpenSRPHierarchy - the response we get from opensrp
 */
const parseHierarchy = (rawOpenSRPHierarchy: RawOpenSRPHierarchy) => {
  // clone the locationTree, we are going to be mutating a copy
  const rawLocationsTreeClone = cloneDeep(rawOpenSRPHierarchy);
  // assumption here: locationsTreeClone has a single object under map, i.e there is only one root jurisdiction
  const { map } = rawLocationsTreeClone.locationsHierarchy;

  const parentNodeWithChildren = parseParent(map);
  parseChildren(parentNodeWithChildren);
  return (parentNodeWithChildren as unknown) as ParsedHierarchySingleNode;
};

/** takes the raw opensrp hierarchy response and creates a tree model structure
 * @param {RawOpenSRPHierarchy} apiResponse - the response we get from opensrp
 */
export const generateJurisdictionTree = (apiResponse: RawOpenSRPHierarchy) => {
  // TODO - eventually re-write this a reactive hook
  const hierarchy = parseHierarchy(apiResponse);
  const root = tree.parse<ParsedHierarchySingleNode>(hierarchy);
  return root;
};

/** describes a node's attribute field */
export interface HierarchySingleNodeAttributes extends Dictionary<string | number | undefined> {
  geographicLevel: number;
  structureCount?: number;
}

/** Generic type to create types for a single node where children prop is generic */
export interface HierarchySingleNode<T> {
  id: string;
  label: string;
  node: {
    locationId: string;
    name: string;
    parentLocation?: { locationId: string; voided: boolean };
    attributes: HierarchySingleNodeAttributes;
    voided: boolean;
  };
  children: T;
  parent?: string;
}

/** single node description after coming in from the api */
export type RawHierarchySingleNode = HierarchySingleNode<RawHierarchySingleNodeMap>;
/** single node description after our initial custom parsing in preparation of
 * building the tree model
 */
export type ParsedHierarchySingleNode = HierarchySingleNode<ParsedHierarchySingleNode[]>;

/** in the opensrp api hierarchy response, the rawhierarchy will be key'd
 * by the node's id
 */
export interface RawHierarchySingleNodeMap {
  [id: string]: RawHierarchySingleNode;
}

/** describes the full api Response (raw opensrp hierarchy) */
export interface RawOpenSRPHierarchy {
  locationsHierarchy: {
    map: RawHierarchySingleNodeMap;
    parentChildren: Dictionary<string[]>;
  };
}
