import _, { keyBy } from 'lodash';
import { JurisdictionOption } from '../JurisdictionSelect';
import './index.css';

/** structure of jurisdiction tree */
export interface JurisdictionTree {
  id: string;
  isOpen?: boolean;
  key: string;
  label: string;
  nodes: {
    [key: string]: JurisdictionTree;
  };
  parentId: string;
}

export interface JurisdictionTreeById {
  [key: string]: JurisdictionTree;
}

/**
 * builds the jurisdiction tree
 * @param {JurisdictionOption} jurisdictions - api response
 * @param {string} parentId
 * @param {JurisdictionTreeById} currentTreeData - The current displayed tree
 * @param {string} key
 */
export const buildLocationTree = (
  jurisdictions: JurisdictionOption[],
  parentId: string,
  currentTreeData: JurisdictionTreeById,
  key: string
): JurisdictionTreeById => {
  const tree: JurisdictionTreeById = keyBy(
    jurisdictions.map(jur => ({
      id: jur.id,
      key: jur.id,
      label: jur.properties.name,
      nodes: {},
      parentId,
    })),
    'key'
  );
  if (Object.keys(currentTreeData).length) {
    const usedKeys = key ? key.split('/') : [];
    if (usedKeys.length === 1) {
      currentTreeData[usedKeys[0]].nodes = tree;
    }
    if (usedKeys.length > 1) {
      const listToString = `${usedKeys.join('.nodes.')}.nodes`;
      _.set(currentTreeData, listToString, tree);
    }
    return currentTreeData;
  }
  return tree;
};
