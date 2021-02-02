import { mount } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { OpenSRPService } from '../../../services/opensrp';
import {
  ParsedHierarchySingleNode,
  TreeNode,
} from '../../../store/ducks/opensrp/hierarchies/types';
import {
  defaultLocationParams,
  defaultLocationPropertyFilters,
  formatJurisdiction,
  getAncestors,
  getChildren,
  locationAPIEndpoints,
} from '../helpers';
import { withTreeWalker, WithWalkerProps } from '../index';
import {
  locationTree,
  raKashikishiHAHC,
  raKsh2,
  raKsh3,
  raLuapula,
  raNchelenge,
  raZambia,
} from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
jest.mock('../../../configs/env');

describe('PlanAssignment/withTreeWalker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.mockClear();
    fetchMock.resetMocks();
  });

  interface SomeProps extends WithWalkerProps {
    smile: string;
  }

  const SomeComponent = withTreeWalker<SomeProps>(() => <div>I Love Oov</div>);

  const expectedProps = {
    LoadingIndicator: expect.any(Function),
    apiEndPoints: locationAPIEndpoints,
    currentChildren: [],
    currentNode: null,
    getAncestorsFunc: getAncestors,
    getChildrenFunc: getChildren,
    hierarchy: [],
    jurisdictionId: '',
    labels: {
      loadAncestorsError: 'Could not load parents',
      loadChildrenError: 'Could not load children',
    },
    loadChildren: expect.any(Function),
    params: defaultLocationParams,
    propertyFilters: defaultLocationPropertyFilters,
    serviceClass: OpenSRPService,
    smile: ':-)',
    tree: locationTree,
    useJurisdictionNodeType: true,
  };

  const partOfResult = {
    headers: {
      accept: 'application/json',
      authorization: 'Bearer null',
      'content-type': 'application/json;charset=UTF-8',
    },
    method: 'GET',
  };

  it('TreeWalker works when using a tree', async () => {
    const wrapper = mount(<SomeComponent tree={locationTree} smile=":-)" />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const currentTreeNode = locationTree;

    // for some reason we cant select the wrapped component directly, so we get it
    // through the div (that we know is there) and its parent
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren: currentTreeNode.model.children.map((child: ParsedHierarchySingleNode) =>
        formatJurisdiction(child)
      ),
      currentNode: formatJurisdiction(currentTreeNode.model),
      hierarchy: [formatJurisdiction(currentTreeNode.model)],
    });

    expect(fetch.mock.calls).toEqual([]);
    wrapper.unmount();
  });

  it('TreeWalker works when using a tree from a given jurisdictionId', async () => {
    const wrapper = mount(
      <SomeComponent
        jurisdictionId="dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63"
        tree={locationTree}
        smile=":-)"
      />
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const currentTreeNode = locationTree.first(
      node => node.model.id === 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63'
    ); // ra Nchelenge

    if (!currentTreeNode) {
      fail();
    }

    const currentChildren = currentTreeNode.model.children.map((child: ParsedHierarchySingleNode) =>
      formatJurisdiction(child)
    );
    const hierarchy = currentTreeNode
      .getPath()
      .map((item: TreeNode) => formatJurisdiction(item.model));

    // for some reason we cant select the wrapped component directly, so we get it
    // through the div (that we know is there) and its parent
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren,
      currentNode: formatJurisdiction(currentTreeNode.model),
      hierarchy,
      jurisdictionId: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
    });

    expect(currentChildren.length).toEqual(1);
    expect(hierarchy.length).toEqual(3);

    // now lets try and call loadChildren to traverse the tree some more
    await act(async () => {
      const loadChildrenFunc = (wrapper
        .find('div')
        .parent()
        .props() as WithWalkerProps).loadChildren;
      loadChildrenFunc(currentChildren[0], {} as any); // ra Kashikishi HAHC
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const nextCurrentTreeNode = locationTree.first(node => node.model.id === currentChildren[0].id); // ra Kashikishi HAHC
    if (!nextCurrentTreeNode) {
      fail();
    }

    const nextCurrentChildren = nextCurrentTreeNode.model.children.map(
      (child: ParsedHierarchySingleNode) => formatJurisdiction(child)
    );
    const nextHierarchy = nextCurrentTreeNode
      .getPath()
      .map((item: TreeNode) => formatJurisdiction(item.model));

    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren: nextCurrentChildren,
      currentNode: formatJurisdiction(nextCurrentTreeNode.model),
      hierarchy: nextHierarchy,
      jurisdictionId: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
    });

    expect(nextCurrentChildren.length).toEqual(2);
    expect(nextHierarchy.length).toEqual(4);

    // now lets try and call loadChildren to traverse the tree even further
    await act(async () => {
      const loadChildrenFunc = (wrapper
        .find('div')
        .parent()
        .props() as WithWalkerProps).loadChildren;
      loadChildrenFunc(nextCurrentChildren[0], {} as any); // ra_ksh_2
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const nextNextCurrentTreeNode = locationTree.first(
      node => node.model.id === nextCurrentChildren[0].id
    ); // ra_ksh_2

    if (!nextNextCurrentTreeNode) {
      fail();
    }

    const nextNextHierarchy = nextNextCurrentTreeNode
      .getPath()
      .map((item: TreeNode) => formatJurisdiction(item.model));

    // for some reason we cant select the wrapped component directly, so we get it
    // through the div (that we know is there) and its parent
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren: [],
      currentNode: formatJurisdiction(nextNextCurrentTreeNode.model),
      hierarchy: nextNextHierarchy,
      jurisdictionId: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
    });

    expect(nextNextHierarchy.length).toEqual(5);

    expect(fetch.mock.calls).toEqual([]);
    wrapper.unmount();
  });

  it('TreeWalker works when no tree is given', async () => {
    fetch.mockResponses(
      [JSON.stringify(raNchelenge), { status: 200 }],
      [JSON.stringify([raKashikishiHAHC]), { status: 200 }],
      [JSON.stringify(raLuapula), { status: 200 }],
      [JSON.stringify(raZambia), { status: 200 }],
      [JSON.stringify([raKsh2, raKsh3]), { status: 200 }]
    );

    const wrapper = mount(<SomeComponent jurisdictionId={raNchelenge.id} smile=":-)" />);

    // initially shows loading
    expect(wrapper.find('LoadingIndicator').length).toEqual(1);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // then shows the actual content
    expect(wrapper.find('LoadingIndicator').length).toEqual(0);

    const props = {
      ...expectedProps,
      jurisdictionId: raNchelenge.id,
      tree: null,
    };

    expect(wrapper.find('TreeWalker').props()).toEqual(props);

    // for some reason we cant select the wrapped component directly, so we get it
    // through the div (that we know is there) and its parent
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...props,
      currentChildren: [raKashikishiHAHC],
      currentNode: raNchelenge,
      hierarchy: [raZambia, raLuapula, raNchelenge],
      jurisdictionId: raNchelenge.id,
      tree: null,
    });

    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/location/dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/findByProperties?is_jurisdiction=true&return_geometry=false&properties_filter=status:Active,parentId:dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
        partOfResult,
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/cec79f21-33c3-43f5-a8af-59a47aa61b84?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/0ddd9ad1-452b-4825-a92a-49cb9fc82d18?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
    ]);

    // now lets try and call loadChildren (to, well, load children of raKashikishiHAHC)
    await act(async () => {
      const loadChildrenFunc = (wrapper
        .find('div')
        .parent()
        .props() as WithWalkerProps).loadChildren;
      loadChildrenFunc(raKashikishiHAHC, {} as any);
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // the props change to reflect this
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...props,
      currentChildren: [raKsh2, raKsh3],
      currentNode: raKashikishiHAHC,
      hierarchy: [raZambia, raLuapula, raNchelenge, raKashikishiHAHC],
      jurisdictionId: raNchelenge.id,
      tree: null,
    });

    expect(fetch.mock.calls[4]).toEqual([
      'https://test.smartregister.org/opensrp/rest/location/findByProperties?is_jurisdiction=true&return_geometry=false&properties_filter=status:Active,parentId:8d44d54e-8b4c-465c-9e93-364a25739a6d',
      partOfResult,
    ]);

    wrapper.unmount();
  });

  it('TreeWalker works when useJurisdictionNodeType === false', async () => {
    const wrapper = mount(
      <SomeComponent
        jurisdictionId="dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63" // ra Nchelenge
        tree={locationTree}
        useJurisdictionNodeType={false}
        smile=":-)"
      />
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const currentNode = locationTree.first(
      node => node.model.id === 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63'
    );

    if (!currentNode) {
      fail();
    }

    const currentChildren = currentNode.children;
    const hierarchy = currentNode.getPath();

    // for some reason we cant select the wrapped component directly, so we get it
    // through the div (that we know is there) and its parent
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren,
      currentNode,
      hierarchy,
      jurisdictionId: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
      useJurisdictionNodeType: false,
    });

    expect(currentChildren.length).toEqual(1);
    expect(hierarchy.length).toEqual(3);

    // now lets try and call loadChildren to traverse the tree even further
    await act(async () => {
      const loadChildrenFunc = (wrapper
        .find('div')
        .parent()
        .props() as WithWalkerProps).loadChildren;
      loadChildrenFunc(currentChildren[0], {} as any); // ra Kashikishi HAHC
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // drill down
    const nextCurrentNode = locationTree.first(
      node => node.model.id === currentChildren[0].model.id
    ); // ra Kashikishi HAHC

    if (!nextCurrentNode) {
      fail();
    }

    const nextCurrentChildren = nextCurrentNode.children;
    const nextHierarchy = nextCurrentNode.getPath();

    // for some reason we cant select the wrapped component directly, so we get it
    // through the div (that we know is there) and its parent
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren: nextCurrentChildren,
      currentNode: nextCurrentNode,
      hierarchy: nextHierarchy,
      jurisdictionId: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
      useJurisdictionNodeType: false,
    });

    expect(nextCurrentChildren.length).toEqual(2);
    expect(nextHierarchy.length).toEqual(4);
  });
});
