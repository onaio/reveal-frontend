import { CellInfo } from 'react-table';
import { getIRSThresholdAdherenceIndicator } from '../../../../helpers/indicators';

export const NamibiaColumns = [
  {
    Header: 'Name',
    columns: [
      {
        Header: '',
        accessor: 'jurisdiction_name',
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
        Header: 'Following first visit',
        accessor: 'refusalsfirst',
        className: 'centered',
        id: 'refusalsfirst',
      },
      {
        Header: 'Following mop-up',
        accessor: 'refusalsmopup',
        className: 'centered',
        id: 'refusalsmopup',
      },
    ],
  },
  {
    Header: 'Locked',
    columns: [
      {
        Header: 'Following first visit',
        accessor: 'lockedfirst',
        className: 'centered',
        id: 'lockedfirst',
      },
      {
        Header: 'Following mop-up',
        accessor: 'lockedmopup',
        className: 'centered',
        id: 'lockedmopup',
      },
    ],
  },
];
