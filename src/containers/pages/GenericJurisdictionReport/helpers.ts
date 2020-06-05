import { Cell, Column } from 'react-table';
<<<<<<< HEAD:src/containers/pages/GenericJurisdictionReport/helpers.ts
import { getIRSThresholdAdherenceIndicator } from '../../../helpers/indicators';
=======
import { getIRSThresholdAdherenceIndicator } from '../../../../helpers/indicators';
>>>>>>> Replacing typings and props dependent on react-table-v6:src/containers/pages/IRS/JurisdictionsReport/helpers.ts

/** columns for Namibia IRS jurisdictions */
export const NamibiaColumns = [
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

/** columns for Zambia IRS jurisdictions */
export const ZambiaJurisdictionsColumns = [
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

/** columns for  mda point jurisdictions */
export const mdaJurisdictionsColumns = [
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

/** columns for Namibia IRS focus (spray) areas */
export const ZambiaFocusAreasColumns = [
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
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
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

/** IRS Table Columns
 * These are all the table columns for IRS that we know about.
 */
export const plansTableColumns: { [key: string]: Column[] } = {
  mdaJurisdictionsColumns,
  namibia2019: NamibiaColumns,
  zambiaFocusArea2019: ZambiaFocusAreasColumns,
  zambiaJurisdictions2019: ZambiaJurisdictionsColumns,
};
