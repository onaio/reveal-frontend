import flushPromises from 'flush-promises';
import { getAncestors, getChildren } from '../helpers';
import { limitTree, raKsh2, raKsh3, raLuapula, raNchelenge, raZambia } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('TreeWalker/helpers', () => {
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

  it('getAncestors works for root jurisdictions', async () => {
    fetch.mockResponseOnce(JSON.stringify(raZambia), { status: 200 });

    const result = await getAncestors(raZambia);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([]);
    expect(result).toEqual({ error: null, value: [raZambia] });
  });

  it('getAncestors works for non-root jurisdictions', async () => {
    fetch.mockResponses(
      [JSON.stringify(raLuapula), { status: 200 }],
      [JSON.stringify(raZambia), { status: 200 }]
    );

    const result = await getAncestors(raNchelenge);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/cec79f21-33c3-43f5-a8af-59a47aa61b84?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/0ddd9ad1-452b-4825-a92a-49cb9fc82d18?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
    ]);
    expect(result).toEqual({ error: null, value: [raZambia, raLuapula, raNchelenge] });
  });

  it('getChildren works for getting root jurisdictions', async () => {
    fetch.mockResponseOnce(JSON.stringify([raZambia]), { status: 200 });

    const params = {
      is_jurisdiction: true,
      properties_filter: 'status:Active,geographicLevel:0',
      return_geometry: false,
    };
    const result = await getChildren(params, null, limitTree);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&properties_filter=status%3AActive%2CgeographicLevel%3A0&return_geometry=false&jurisdiction_ids=0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
        partOfResult,
      ],
    ]);
    expect(result).toEqual({ error: null, value: [raZambia] });
  });

  it('getChildren works for getting root jurisdictions with limitTree not set', async () => {
    fetch.mockResponseOnce(JSON.stringify([raZambia]), { status: 200 });

    const params = {
      is_jurisdiction: true,
      properties_filter: 'status:Active,geographicLevel:0',
      return_geometry: false,
    };
    const result = await getChildren(params, null);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/findByProperties?is_jurisdiction=true&properties_filter=status%3AActive%2CgeographicLevel%3A0&return_geometry=false',
        partOfResult,
      ],
    ]);
    expect(result).toEqual({ error: null, value: [raZambia] });
  });

  it('getChildren does not return duplicate jurisdictions', async () => {
    fetch.mockResponseOnce(JSON.stringify([raZambia, raZambia]), { status: 200 });

    const params = {
      is_jurisdiction: true,
      properties_filter: 'status:Active,geographicLevel:0',
      return_geometry: false,
    };
    const result = await getChildren(params, null, limitTree);
    await flushPromises();
    expect(result).toEqual({ error: null, value: [raZambia] });
  });

  it('getChildren works for getting non-root jurisdictions', async () => {
    fetch.mockResponseOnce(JSON.stringify([raKsh2, raKsh3]), { status: 200 });

    const params = {
      is_jurisdiction: true,
      properties_filter: `status:Active,parentId:${limitTree[1].jurisdiction_id}`,
      return_geometry: false,
    };
    const result = await getChildren(params, limitTree[1].jurisdiction_id, limitTree);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&properties_filter=status%3AActive%2CparentId%3A8d44d54e-8b4c-465c-9e93-364a25739a6d&return_geometry=false&jurisdiction_ids=fca0d71d-0410-45d3-8305-a9f092a150b8%2Cxyz0d71d-0410-45d3-8305-a9f092a150b8',
        partOfResult,
      ],
    ]);
    expect(result).toEqual({ error: null, value: [raKsh2, raKsh3] });

    // Same data as the above but now test that it will work when chunkSize requires multiple fetches from the API
    fetchMock.mockClear();
    fetchMock.resetMocks();

    fetch.mockResponses(
      [JSON.stringify([raKsh2]), { status: 200 }],
      [JSON.stringify([raKsh3]), { status: 200 }]
    );

    const result2 = await getChildren(params, limitTree[1].jurisdiction_id, limitTree, 1);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&properties_filter=status%3AActive%2CparentId%3A8d44d54e-8b4c-465c-9e93-364a25739a6d&return_geometry=false&jurisdiction_ids=fca0d71d-0410-45d3-8305-a9f092a150b8',
        partOfResult,
      ],
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&properties_filter=status%3AActive%2CparentId%3A8d44d54e-8b4c-465c-9e93-364a25739a6d&return_geometry=false&jurisdiction_ids=xyz0d71d-0410-45d3-8305-a9f092a150b8',
        partOfResult,
      ],
    ]);
    expect(result2).toEqual({ error: null, value: [raKsh2, raKsh3] });
  });

  it('getChildren works for getting non-root jurisdictions with limitTree not set', async () => {
    fetch.mockResponseOnce(JSON.stringify([raKsh2, raKsh3]), { status: 200 });

    const params = {
      is_jurisdiction: true,
      properties_filter: `status:Active,parentId:${limitTree[1].jurisdiction_id}`,
      return_geometry: false,
    };
    const result = await getChildren(params, limitTree[1].jurisdiction_id);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/location/findByProperties?is_jurisdiction=true&properties_filter=status%3AActive%2CparentId%3A8d44d54e-8b4c-465c-9e93-364a25739a6d&return_geometry=false',
        partOfResult,
      ],
    ]);
    expect(result).toEqual({ error: null, value: [raKsh2, raKsh3] });
  });
});
