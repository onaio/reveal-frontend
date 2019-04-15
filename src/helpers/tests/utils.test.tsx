import { getLocationColumns } from '../utils';

describe('helpers/utils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getLocationColumns works okay', () => {
    const items = [
      {
        identifier: 'province',
        name: 'Province',
      },
      {
        identifier: 'district',
        name: 'District',
      },
    ];

    expect(getLocationColumns(items, false)).toEqual([
      {
        Header: 'Province',
        accessor: 'province',
      },
      {
        Header: 'District',
        accessor: 'district',
      },
    ]);

    expect(getLocationColumns(items, true)).toEqual([
      {
        Header: 'Province',
        columns: [
          {
            Header: '',
            accessor: 'province',
          },
        ],
      },
      {
        Header: 'District',
        columns: [
          {
            Header: '',
            accessor: 'district',
          },
        ],
      },
    ]);
  });
});
