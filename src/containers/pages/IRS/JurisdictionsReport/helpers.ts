import { CellInfo } from 'react-table';
import { getIRSThresholdAdherenceIndicator } from '../../../../helpers/indicators';
import { FlexObject } from '../../../../helpers/utils';

/** columns for Namibia IRS jurisdictions */
export const NamibiaColumns = [
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

/** extract hierarchical tree of jurisdictions as a list, with the highest
 * level item in the hierarchy as the 0th element
 * @param {FlexObject[]} tree - the data set
 * @param {FlexObject} item - the item in question
 * @returns {FlexObject[]} - the hierarchy for the item in question
 */
export function getTree(
  tree: FlexObject[],
  item: FlexObject,
  result: FlexObject[] = []
): FlexObject[] {
  if (item.jurisdiction_parent_id === null && !result.includes(item)) {
    result.push(item);
  } else {
    const parentItems = tree.filter(el => el.jurisdiction_id === item.jurisdiction_parent_id);
    if (parentItems.length > 0) {
      if (!result.includes(parentItems[0])) {
        result.push(parentItems[0]);
      }
      return getTree(tree, parentItems[0], result);
    }
  }
  return result;
}
