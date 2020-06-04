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
    columns: [
      {
        accessor: 'jurisdiction_name',
        minWidth: 180,
      },
    ],
  },
  {
    Header: 'Structures Targeted',
    columns: [
      {
        accessor: 'target_2019',
      },
    ],
  },
  {
    Header: 'Structures Found',
    columns: [
      {
        accessor: 'structuresfound',
      },
    ],
  },
  {
    Header: 'Structures Sprayed',
    columns: [
      {
        accessor: 'structuressprayed',
      },
    ],
  },
  {
    Header: 'Target Coverage',
    columns: [
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),

        accessor: 'targetcoverage',
        className: 'indicator centered',
      },
    ],
  },
  {
    Header: 'Found Coverage',
    columns: [
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),

        accessor: 'foundcoverage',
        className: 'indicator centered',
      },
    ],
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'roomcov',
        className: 'indicator centered',
      },
    ],
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
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
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
        Header: '',
        accessor: 'roomcov',
        className: 'indicator centered',
      },
    ],
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
