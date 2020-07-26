import { TreeNode } from '../types';
import {
  generateJurisdictionTree,
  META_STRUCTURE_COUNT,
  preOrderStructureCountComputation,
} from '../utils';
import { raZambiaHierarchy, sampleHierarchy, sampleHierarchyWithoutStructures } from './fixtures';

describe('hierarchyReducer.utils', () => {
  it('generates a jurisdiction tree model correctly', () => {
    const root = generateJurisdictionTree(sampleHierarchy);
    expect(root.hasChildren()).toBeTruthy();
    expect(root.model.id).toEqual('2942');
    expect(root.model.label).toEqual('Lusaka');

    expect(root.children.length).toEqual(1);
    const singleChild = root.children[0];

    expect(singleChild.model.id).toEqual('3019');
    expect(singleChild.parent.model.id).toEqual('2942');
    expect(singleChild.children.length).toEqual(1);
  });

  it('computes structure count correctly', () => {
    const root = generateJurisdictionTree(raZambiaHierarchy);
    // we will drop one of the immediate children and re-compute structure count
    // see if its what we expect.

    // drop lusaka
    const lusaka = root.first(node => node.model.id === '2942');
    if (!lusaka) {
      fail();
    }
    lusaka.drop();

    // compute new structure count
    preOrderStructureCountComputation(root);

    // expect all nodes to have a new meta field for structure count
    root.walk(node => {
      expect(node.model.meta[META_STRUCTURE_COUNT]).toBeDefined();
      return true;
    });

    // expect the root node to have meta structure count of  0
    expect(root.model.meta[META_STRUCTURE_COUNT]).toEqual(0);

    // the sum of all leaf nodes is equal to the structure count of the parent
    const allChildren: TreeNode[] = [];
    root.walk(node => {
      if (!node.hasChildren()) {
        allChildren.push(node);
      }
      return true;
    });

    const reduceStructureCount = (acc: number, value: number) => acc + value;
    const allChildrenStructureCounts = allChildren.map(
      childNode => childNode.model.node.attributes.structureCount
    );
    const childrenStructureCountSum = allChildrenStructureCounts.reduce(reduceStructureCount, 0);
    expect(childrenStructureCountSum).toEqual(root.model.meta[META_STRUCTURE_COUNT]);
  });

  it('computes meta structure count correctly when no structures', () => {
    const root = generateJurisdictionTree(sampleHierarchyWithoutStructures);

    preOrderStructureCountComputation(root);

    // expect all nodes to have a new meta field for structure count
    root.walk(node => {
      expect(node.model.meta[META_STRUCTURE_COUNT]).toEqual(0);
      return true;
    });
  });
});
