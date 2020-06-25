import { generateJurisdictionTree } from '../utils';
import { sampleHierarchy } from './fixtures';

describe('jurisdictionSelectorPage.urils', () => {
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
});
