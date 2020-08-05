import { generateJurisdictionTree, setSelectOnNode } from '../utils';
import { SELECTION_REASON } from '../constants';

const zambiaHierarchy = require('./ZambiaHierarchy.json');

const benchmark = (action: (args?: any) => void, message?: string, ...args: any) => {
  const start = process.hrtime.bigint();
  action(args);
  const end = process.hrtime.bigint();

  const NS_IN_S = 1e-9;
  const timeDiff = end - start;
  const seconds = Number(timeDiff) * NS_IN_S;

  console.log(`${message} benchmark took ${timeDiff} nanoseconds (${seconds.toFixed(5)} seconds)`);
};

describe('reducer/hierarchies#stress', () => {
  it('generates a jurisdiction tree model correctly', () => {
    const action = () => {
      generateJurisdictionTree(zambiaHierarchy);
    };
    benchmark(action, 'CreatingTree');
  });

  it('benchmark to walking the tree', () => {
    const root = generateJurisdictionTree(zambiaHierarchy);
    const action = () => {
      root.walk(node => node.hasChildren());
    };

    benchmark(action, 'walking the tree');
  });
  
  it('calling selectNode on the root node (worst case)', () => {
    const tree = generateJurisdictionTree(zambiaHierarchy);
    
    const action = () => {
      const res = setSelectOnNode(tree, tree.model.id, SELECTION_REASON.USER_CHANGE, true, false, false);
    };

    const anotherAction = () => {
      const res = setSelectOnNode(tree, tree.model.id, SELECTION_REASON.USER_CHANGE, true, false, true);
    }

    benchmark(action, 'selecting node without cascade');
    benchmark(anotherAction, 'selecting node with cascade down');
  });
});
