import { DrillDownColumn } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { Cell } from 'react-table';
import { getIRSThresholdAdherenceIndicator } from '../../../../../helpers/indicators';

/* tslint:disable no-var-requires */
export const ZambiaJurisdictionsJSON = require('./zambia_jurisdictions.json');
export const NamibiaJurisdictionsJSON = require('./namibia_jurisdictions.json');
export const ZambiaFocusAreasJSON = require('./zambia_focus_areas.json');
export const NamibiaFocusAreasJSON = require('./namibia_focus_areas.json');
export const ZambiaStructuresJSON = require('./zambia_structures.json');
export const ZambiaAkros1JSON = require('./zambia_akros1.json');
export const NamibiaAkros1JSON = require('./namibia_akros1.json');
export const ZambiaKMZ421StructuresJSON = require('./zambia_kmz_421_structures.json');
export const ZambiaKMZ421JSON = require('./zambia_kmz_421.json');
export const NamibiaColumns: Array<DrillDownColumn<Dictionary>> = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Structures Targeted',
    accessor: 'target_2019',
  },
  {
    Header: 'Structures Found',
    accessor: 'structuresfound',
  },
  {
    Header: 'Structures Sprayed',
    accessor: 'structuressprayed',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Target Coverage',
    accessor: 'targetcoverage',
    className: 'indicator centered',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
    className: 'indicator centered',
  },
  {
    Header: 'Refusals',
    columns: [
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'refusalsfirst',
        className: 'indicator centered',
        id: 'refusalsfirst',
      },
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'lockedfirst',
        className: 'indicator centered',
        id: 'lockedfirst',
      },
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following mop-up',
        accessor: 'lockedmopup',
        className: 'indicator centered',
        id: 'lockedmopup',
      },
    ],
    headerClassName: 'centered',
  },
];

export const ZambiaFocusAreasColumns: Array<DrillDownColumn<Dictionary>> = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Structures on the ground',
    accessor: 'totstruct',
  },
  {
    Header: 'Found',
    accessor: 'foundstruct',
  },
  {
    Header: 'Sprayed',
    accessor: 'sprayedstruct',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray Coverage (Effectiveness)',
    accessor: 'spraycov',
    className: 'indicator centered',
  },
  {
    Header: 'Found Coverage',

    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),

    accessor: 'spraytarg',
    className: 'indicator centered',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray Success Rate (PMI SC)',
    accessor: 'spraysuccess',
    className: 'indicator centered',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Room coverage of structures sprayed',
    accessor: 'roomcov',
    className: 'indicator centered',
  },
];

export const ZambiaJurisdictionsColumns: Array<DrillDownColumn<Dictionary>> = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Total Spray Areas',
    accessor: 'totareas',
  },
  {
    Header: 'Targeted Spray Areas',
    accessor: 'targareas',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: '% visited Spray Areas Effectively sprayed',
    accessor: 'perctvisareaseffect',
    className: 'indicator centered',
  },
  {
    Header: 'Total Structures',
    accessor: 'totstruct',
  },
  {
    Header: 'Targeted Structures',
    accessor: 'targstruct',
  },
  {
    Header: 'Sprayed Structures',
    accessor: 'sprayedstruct',
  },

  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray coverage of targeted (Progress)',
    accessor: 'spraycovtarg',
    className: 'indicator centered',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Room coverage of structures sprayed',
    accessor: 'roomcov',
    className: 'indicator centered',
  },
];

export const mdaPointColumns = [
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
    Header: 'Total SACs Registered',
    columns: [
      {
        Header: '',
        accessor: 'sacregistered',
      },
    ],
  },
  {
    Header: 'MMA Coverage',
    columns: [
      {
        Header: '',
        accessor: 'mmacov',
      },
    ],
  },
  {
    Header: 'MMA Coverage (%)',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'mmacovper',
      },
    ],
  },
  {
    Header: 'SACs Refused',
    columns: [
      {
        Header: '',
        accessor: 'sacrefused',
      },
    ],
  },
  {
    Header: 'SACs Sick/Pregnant/Contraindicated',
    columns: [
      {
        Header: '',
        accessor: 'sacrefmedreason',
      },
    ],
  },
  {
    Header: 'ADR Reported (%)',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'mmaadr',
      },
    ],
  },
  {
    Header: 'ADR Severe (%)',
    columns: [
      {
        Cell: (cell: CellInfo) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'mmaadrsev',
      },
    ],
  },
  {
    Header: 'Alb Tablets Distributed',
    columns: [
      {
        Header: '',
        accessor: 'albdist',
      },
    ],
  },
];
/* tslint:enable no-var-requires */
