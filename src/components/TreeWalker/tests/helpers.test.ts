import flushPromises from 'flush-promises';
import { getAncestors, getJurisdictions } from '../helpers';
import { raKsh2, raKsh3, raLuapula, raNchelenge, raZambia } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
jest.mock('../../../configs/env');

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
        'https://test.smartregister.org/opensrp/rest/location/cec79f21-33c3-43f5-a8af-59a47aa61b84?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/0ddd9ad1-452b-4825-a92a-49cb9fc82d18?is_jurisdiction=true&return_geometry=false',
        partOfResult,
      ],
    ]);
    expect(result).toEqual({ error: null, value: [raZambia, raLuapula, raNchelenge] });
  });

  it('getJurisdictions just works', async () => {
    const params = {
      is_jurisdiction: true,
      properties_filter: `status:Active`,
      return_geometry: false,
    };

    const result0 = await getJurisdictions([], params);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([]);
    expect(result0).toEqual({ error: null, value: [] });

    fetchMock.mockClear();
    fetchMock.resetMocks();

    fetch.mockResponseOnce(JSON.stringify([raZambia, raKsh2, raKsh3]), { status: 200 });
    const result = await getJurisdictions(
        [raZambia.id, raKsh2.id, raKsh2.id, raKsh3.id],
        params
      ) /** the duplicate should be ignored */;
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&properties_filter=status:Active&return_geometry=false&jurisdiction_ids=0ddd9ad1-452b-4825-a92a-49cb9fc82d18,fca0d71d-0410-45d3-8305-a9f092a150b8,xyz0d71d-0410-45d3-8305-a9f092a150b8',
        partOfResult,
      ],
    ]);
    expect(result).toEqual({ error: null, value: [raZambia, raKsh2, raKsh3] });

    // Same data as the above but now test that it getChildren(params, limitTree[1].jurisdiction_id, limitTree, 1)will work when chunkSize requires multiple fetches from the API
    fetchMock.mockClear();
    fetchMock.resetMocks();

    fetch.mockResponses(
      [JSON.stringify([raZambia, raKsh2]), { status: 200 }],
      [JSON.stringify([raKsh3]), { status: 200 }]
    );

    const result2 = await getJurisdictions([raZambia.id, raKsh2.id, raKsh3.id], params, 2);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&properties_filter=status:Active&return_geometry=false&jurisdiction_ids=0ddd9ad1-452b-4825-a92a-49cb9fc82d18,fca0d71d-0410-45d3-8305-a9f092a150b8',
        partOfResult,
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&properties_filter=status:Active&return_geometry=false&jurisdiction_ids=xyz0d71d-0410-45d3-8305-a9f092a150b8',
        partOfResult,
      ],
    ]);
    expect(result2).toEqual({ error: null, value: [raZambia, raKsh2, raKsh3] });
  });
});
