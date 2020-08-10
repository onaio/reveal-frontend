import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  autoSelectNodes,
  deforest,
  fetchTree,
  getAllSelectedNodes,
  getSelectedHierarchy,
  reducerName,
  selectNode,
} from '..';
import store from '../../../../index';
import { SELECTION_REASON } from '../constants';
import { TreeNode } from '../types';
import {
  applyMeta,
  generateJurisdictionTree,
  preOrderStructureCountComputation,
  setSelectOnNode,
} from '../utils';
import { zambiaHierarchy } from './fixtures';

reducerRegistry.register(reducerName, reducer);

const zambiaId = '22bc44dd-752d-4c20-8761-617361b4f1e7';
const planId = 'someRandomPlanId';

let flushThunks;

export const benchmark = (action: (args?: any) => void, message?: string, ...args: any) => {
  const start = process.hrtime.bigint();
  action(args);
  const end = process.hrtime.bigint();

  const NS_IN_S = 1e-9;
  const timeDiff = end - start;
  const seconds = Number(timeDiff) * NS_IN_S;

  // tslint:disable-next-line: no-console
  console.log(
    `${message}: {using Zambia} benchmark took ${timeDiff} nanoseconds (${seconds.toFixed(
      5
    )} seconds)`
  );
};

const selectedHierarchySelector = getSelectedHierarchy();

describe('reducer/hierarchies#stress', () => {
  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(deforest());
  });
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
      setSelectOnNode(tree, tree.model.id, SELECTION_REASON.USER_CHANGE, true, false, false);
    };

    const cascadeDownAction = () => {
      setSelectOnNode(tree, tree.model.id, SELECTION_REASON.USER_CHANGE, true, false, true);
    };

    const cascadeUpAction = () => {
      setSelectOnNode(
        tree,
        '9e1ea1c1-edd7-45cb-99e0-b0bf33fd9ff3',
        SELECTION_REASON.USER_CHANGE,
        true,
        true,
        false
      );
    };

    benchmark(action, 'selecting node without cascade');
    benchmark(cascadeDownAction, 'selecting node with cascade down');
    benchmark(cascadeUpAction, 'selecting node with cascade up');
  });

  it('benchmarking select node action', () => {
    store.dispatch(fetchTree(zambiaHierarchy));
    const selectAction = () => {
      store.dispatch(selectNode(zambiaId, '2942', planId));
    };

    benchmark(selectAction, 'calling select action node');
  });

  it('benchmarking node autoSelection', () => {
    store.dispatch(fetchTree(zambiaHierarchy));
    const callback = (node: TreeNode) => !!node.model;

    const autoSelectionAction = () => {
      store.dispatch(autoSelectNodes(zambiaId, callback, planId));
    };

    benchmark(autoSelectionAction, 'autoSelect nodes');
  });

  it('benchmarking tree with meta auto-selection', () => {
    store.dispatch(fetchTree(zambiaHierarchy));
    const callback = (node: TreeNode) => !!node.model;
    store.dispatch(autoSelectNodes(zambiaId, callback, planId));

    const filters = {
      planId,
      rootJurisdictionId: zambiaId,
    };

    const selectorsAction = () => {
      getAllSelectedNodes()(store.getState(), {
        ...filters,
        leafNodesOnly: false,
      });
    };

    const selectedHierarchySelectorAction = () => {
      selectedHierarchySelector(store.getState(), filters);
    };

    const meta = store.getState()[reducerName].metaData[zambiaId][planId];
    const selectedHierarchy = selectedHierarchySelector(store.getState(), filters);
    if (!selectedHierarchy) {
      fail();
    }
    const nodes = selectedHierarchy.all(() => true);
    const applyMetaAction = () => {
      applyMeta(nodes, meta);
    };

    benchmark(applyMetaAction, `Applying meta to ${nodes.length}`);
    benchmark(selectedHierarchySelectorAction, 'recreating tree');
    benchmark(selectorsAction, 'allSelectedNodes');
  });

  it('benchmarking pre order structure computation', () => {
    const tree = generateJurisdictionTree(zambiaHierarchy);

    const preOrderAction = () => {
      preOrderStructureCountComputation(tree);
    };

    benchmark(preOrderAction, 'pre-order structure computation');
  });
});
