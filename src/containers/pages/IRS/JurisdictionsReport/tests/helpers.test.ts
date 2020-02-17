import { CellInfo, Column } from 'react-table';
import { getIRSThresholdAdherenceIndicator } from '../../../../../helpers/indicators';
import * as helpers from '../helpers';

const NamibiaColumns: Column[] = [
  {
    Header: 'Name',
    columns: [
      {
        Header: '',
        accessor: 'jurisdiction_name',
        minWidth: 180,
      },
    ],
  },
  {
    Header: 'Structures Targeted',
    columns: [
      {
        Header: '',
        accessor: 'target_2019',
      },
    ],
  },
  {
    Header: 'Structures Found',
    columns: [
      {
        Header: '',
        accessor: 'structuresfound',
      },
    ],
  },
  {
    Header: 'Structures Sprayed',
    columns: [
      {
        Header: '',
        accessor: 'structuressprayed',
      },
    ],
  },
  {
    Header: 'Target Coverage',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'targetcoverage',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Found Coverage',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'foundcoverage',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Refusals',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'refusalsfirst',
        className: 'indicator centered',
        id: 'refusalsfirst',
      },
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following mop-up',
        accessor: 'refusalsmopup',
        className: 'indicator centered',
        id: 'refusalsmopup',
      },
    ],
    headerClassName: 'centered',
  },
  {
    Header: 'Locked',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'lockedfirst',
        className: 'indicator centered',
        id: 'lockedfirst',
      },
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following mop-up',
        accessor: 'lockedmopup',
        className: 'indicator centered',
        id: 'lockedmopup',
      },
    ],
    headerClassName: 'centered',
  },
];

const ZambiaFocusAreasColumns: Column[] = [
  {
    Header: 'Name',
    columns: [
      {
        Header: '',
        accessor: 'jurisdiction_name',
        minWidth: 180,
      },
    ],
  },
  {
    Header: 'Structures on the ground',
    columns: [
      {
        Header: '',
        accessor: 'totstruct',
      },
    ],
  },
  {
    Header: 'Found',
    columns: [
      {
        Header: '',
        accessor: 'foundstruct',
      },
    ],
  },
  {
    Header: 'Sprayed',
    columns: [
      {
        Header: '',
        accessor: 'sprayedstruct',
      },
    ],
  },
  {
    Header: 'Spray Coverage (Effectiveness)',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'spraycov',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Found Coverage',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'spraytarg',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Spray Success Rate (PMI SC)',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'spraysuccess',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Room coverage of structures sprayed',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'roomcov',
        className: 'indicator centered',
      },
    ],
  },
];

const ZambiaJurisdictionsColumns: Column[] = [
  {
    Header: 'Name',
    columns: [
      {
        Header: '',
        accessor: 'jurisdiction_name',
        minWidth: 180,
      },
    ],
  },
  {
    Header: 'Total Spray Areas',
    columns: [
      {
        Header: '',
        accessor: 'totareas',
      },
    ],
  },
  {
    Header: 'Targeted Spray Areas',
    columns: [
      {
        Header: '',
        accessor: 'targareas',
      },
    ],
  },
  {
    Header: '% visited Spray Areas Effectively sprayed',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'perctvisareaseffect',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Total Structures',
    columns: [
      {
        Header: '',
        accessor: 'totstruct',
      },
    ],
  },
  {
    Header: 'Targeted Structures',
    columns: [
      {
        Header: '',
        accessor: 'targstruct',
      },
    ],
  },
  {
    Header: 'Sprayed Structures',
    columns: [
      {
        Header: '',
        accessor: 'sprayedstruct',
      },
    ],
  },
  {
    Header: 'Spray coverage of targeted (Progress)',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'spraycovtarg',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Room coverage of structures sprayed',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'roomcov',
        className: 'indicator centered',
      },
    ],
  },
];

describe('NamibiaColumns', () => {
  it('should return the correct columns', () => {
    expect(JSON.stringify(helpers.NamibiaColumns)).toEqual(JSON.stringify(NamibiaColumns));
  });
});

describe('ZambiaFocusAreasColumns', () => {
  it('should return the correct columns', () => {
    expect(JSON.stringify(helpers.ZambiaFocusAreasColumns)).toEqual(
      JSON.stringify(ZambiaFocusAreasColumns)
    );
  });
});

describe('ZambiaJurisdictionsColumns', () => {
  it('should return the correct columns', () => {
    expect(JSON.stringify(helpers.ZambiaJurisdictionsColumns)).toEqual(
      JSON.stringify(ZambiaJurisdictionsColumns)
    );
  });
});

describe('IRSTableColumns', () => {
  it('should return the correct keys', () => {
    expect(Object.keys(helpers.IRSTableColumns)).toEqual([
      'namibia2019',
      'zambiaFocusArea2019',
      'zambiaJurisdictions2019',
    ]);
  });
  it('it should return the correct table columns for namibia2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.namibia2019)).toEqual(
      JSON.stringify(NamibiaColumns)
    );
  });

  it('should return the correct table columns for zambiaFocusArea2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.zambiaFocusArea2019)).toEqual(
      JSON.stringify(ZambiaFocusAreasColumns)
    );
  });

  it('should return the correct columns for zambiaJurisdictions2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.zambiaJurisdictions2019)).toEqual(
      JSON.stringify(ZambiaJurisdictionsColumns)
    );
  });
});
