import { mount } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import { OpenSRPService } from '../../../services/opensrp';
import {
  defaultLocationParams,
  defaultLocationPropertyFilters,
  getAncestors,
  getChildren,
} from '../helpers';
import { withTreeWalker, WithWalkerProps } from '../index';
import {
  limitTree,
  raKashikishiHAHC,
  raKsh2,
  raKsh3,
  raLuapula,
  raNchelenge,
  raZambia,
} from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('PlanAssignment/withTreeWalker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.mockClear();
    fetchMock.resetMocks();
  });

  const partOfResult = {
    headers: {
      accept: 'application/json',
      authorization: 'Bearer null',
      'content-type': 'application/json;charset=UTF-8',
    },
    method: 'GET',
  };

  it('TreeWalker receives the expected props', async () => {
    fetch.mockResponses(
      [JSON.stringify(raNchelenge), { status: 200 }],
      [JSON.stringify([raKashikishiHAHC]), { status: 200 }],
      [JSON.stringify(raLuapula), { status: 200 }],
      [JSON.stringify(raZambia), { status: 200 }],
      [JSON.stringify([raKsh2, raKsh3]), { status: 200 }]
    );

    interface SomeProps extends WithWalkerProps {
      smile: string;
    }

    const SomeComponent = withTreeWalker<SomeProps>(() => <div>I Love Oov</div>);

    const wrapper = mount(
      <SomeComponent jurisdictionId={raNchelenge.id} limits={limitTree} smile=":-)" />
    );

    // initially shows loading
    expect(wrapper.find('LoadingIndicator').length).toEqual(1);

    await flushPromises();
    wrapper.update();

    // then shows the actual content
    expect(wrapper.find('LoadingIndicator').length).toEqual(0);

    const expectedProps = {
      LoadingIndicator: expect.any(Function),
      currentChildren: [],
      currentNode: null,
      getAncestorsFunc: getAncestors,
      getChildrenFunc: getChildren,
      hierarchy: [],
      jurisdictionId: raNchelenge.id,
      labels: {
        loadAncestorsError: 'Could not load parents',
      },
      limits: limitTree,
      loadChildren: expect.any(Function),
      params: defaultLocationParams,
      propertyFilters: defaultLocationPropertyFilters,
      readAPIEndpoint: 'location',
      serviceClass: OpenSRPService,
      smile: ':-)',
    };

    expect(wrapper.find('TreeWalker').props()).toEqual(expectedProps);

    // for some reason we cant select the wrapped component directly, so we get it
    // through the div (that we know is there) and its parent
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren: [raKashikishiHAHC],
      currentNode: raNchelenge,
      hierarchy: [raZambia, raLuapula, raNchelenge],
    });

    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&return_geometry=false&properties_filter=status%3AActive%2CparentId%3Adfb858b5-b3e5-4871-9d1c-ae2f3fa83b63&jurisdiction_ids=8d44d54e-8b4c-465c-9e93-364a25739a6d',
        partOfResult,
      ],
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/cec79f21-33c3-43f5-a8af-59a47aa61b84?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/0ddd9ad1-452b-4825-a92a-49cb9fc82d18?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
    ]);

    // now lets try and call loadChildren (to, well, load children of raKashikishiHAHC)
    const loadChildrenFunc = (wrapper
      .find('div')
      .parent()
      .props() as WithWalkerProps).loadChildren;
    loadChildrenFunc(raKashikishiHAHC, {} as any);

    await flushPromises();
    wrapper.update();

    // the props change to reflect this
    expect(
      wrapper
        .find('div')
        .parent()
        .props()
    ).toEqual({
      ...expectedProps,
      currentChildren: [raKsh2, raKsh3],
      currentNode: raKashikishiHAHC,
      hierarchy: [raZambia, raLuapula, raNchelenge, raKashikishiHAHC],
    });

    expect(fetch.mock.calls[4]).toEqual([
      'https://reveal-stage.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&return_geometry=false&properties_filter=status%3AActive%2CparentId%3A8d44d54e-8b4c-465c-9e93-364a25739a6d&jurisdiction_ids=fca0d71d-0410-45d3-8305-a9f092a150b8%2Cxyz0d71d-0410-45d3-8305-a9f092a150b8',
      partOfResult,
    ]);

    wrapper.unmount();
  });
});
