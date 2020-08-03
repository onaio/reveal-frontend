import { Dictionary } from '@onaio/utils';
import TreeModel from 'tree-model';

/** describes a node's attribute field */
export interface HierarchySingleNodeAttributes {
  geographicLevel: number;
  structureCount?: number;
}

/** Generic type to create types for a single node where children prop is generic */
export interface HierarchySingleNode<TChild> {
  id: string;
  label: string;
  node: {
    locationId: string;
    name: string;
    parentLocation?: { locationId: string; voided: boolean };
    attributes: HierarchySingleNodeAttributes;
    voided: boolean;
  };
  children?: TChild;
  parent?: string;
}
/** properties that will be added to meta field */
export interface Meta {
  selected?: boolean;
  actionBy?: string;
  metaStructureCount?: number;
}

/** field that we will use to add ad-hoc information to a node
 * this field will be added to each node during parsing the raw data from the api
 */
export interface MetaField {
  meta: Meta;
}

/** single node description after coming in from the api */
export type RawHierarchySingleNode = HierarchySingleNode<RawHierarchySingleNodeMap>;

/** single node description after our initial custom parsing in preparation of
 * building the tree model
 */
export type ParsedHierarchySingleNode = HierarchySingleNode<ParsedHierarchySingleNode[]> &
  MetaField;

/** in the opensrp api hierarchy response, the raw hierarchy will be key'd
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

/** helper type, shortened form */
export type TreeNode = TreeModel.Node<ParsedHierarchySingleNode>;

/** describes callback used by the autoSelect functionality */
export type AutoSelectCallback = (node: TreeNode) => boolean;
