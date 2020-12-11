import { DrillDownColumn, DrillDownTableProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import { Cell } from 'react-table';
import {
  getIRSLiteThresholdAdherenceIndicator,
  getIRSThresholdAdherenceIndicator,
  renderPercentage,
} from '../../../helpers/indicators';
import { GenericJurisdiction } from '../../../store/ducks/generic/jurisdictions';

/** columns for Namibia IRS jurisdictions */
export const NamibiaColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Structures Targeted',
    accessor: 'jurisdiction_target',
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
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
    sortType: 'basic',
  },
  {
    Header: 'Refusals',
    columns: [
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'refusalsfirst',
        id: 'refusalsfirst',
        sortType: 'basic',
      },
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following mop-up',
        accessor: 'refusalsmopup',
        id: 'refusalsmopup',
        sortType: 'basic',
      },
    ],
  },
  {
    Header: 'Locked',
    columns: [
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'lockedfirst',
        id: 'lockedfirst',
        sortType: 'basic',
      },
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following mop-up',
        accessor: 'lockedmopup',
        id: 'lockedmopup',
        sortType: 'basic',
      },
    ],
  },
];

/** columns for Zambia IRS jurisdictions */
export const ZambiaJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 360,
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
    Header: 'Spray areas visited',
    accessor: 'visitedareas',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: '% visited Spray Areas Effectively sprayed',
    accessor: 'perctvisareaseffect',
    sortType: 'basic',
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
    sortType: 'basic',
  },
  {
    Header: 'Structures Found',
    accessor: 'foundstruct',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Success Rate',
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
];

/** columns for Zambia IRS Lite jurisdictions */
export const IRSLiteZambiaJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 360,
  },
  {
    Header: 'Total Spray Areas',
    accessor: 'totareas',
  },
  {
    Header: 'Spray Areas Targeted',
    accessor: 'targareas',
  },
  {
    Header: 'Spray Areas Visited',
    accessor: 'visitedareas',
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
    Header: 'Structures Sprayed',
    accessor: 'sprayed',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: '% Total Structures Sprayed',
    accessor: 'spraycov',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: '% Targeted Structures Sprayed',
    accessor: 'spraycovtarg',
    sortType: 'basic',
  },
  {
    Header: 'Structures Found',
    accessor: 'found',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Success Rate',
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
];

/** columns for  mda point jurisdictions */
export const mdaJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Total SACs Registered',
    accessor: 'sacregistered',
  },
  {
    Header: 'MMA Coverage',
    accessor: 'mmacov',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'MMA Coverage (%)',
    accessor: 'mmacovper',
    sortType: 'basic',
  },
  {
    Header: 'SACs Refused',
    accessor: 'sacrefused',
  },
  {
    Header: 'SACs Sick/Pregnant/Contraindicated',
    accessor: 'sacrefmedreason',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'ADR Reported (%)',
    accessor: 'mmaadr',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'ADR Severe (%)',
    accessor: 'mmaadrsev',
    sortType: 'basic',
  },
  {
    Header: 'Alb Tablets Distributed',
    accessor: 'albdist',
  },
];

/** columns for Namibia IRS focus (spray) areas */
export const ZambiaFocusAreasColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 360,
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
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'spraytarg',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray Success Rate (PMI SC)',
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => {
      const { value } = cell;
      const intValue = Number(value);
      if (isNaN(intValue)) {
        return intValue;
      } else {
        return Math.ceil(intValue);
      }
    },
    Header: 'Structures remaining to spray to reach 90% SE',
    accessor: 'structures_remaining_to_90_se',
    sortType: 'basic',
  },
  {
    Header: 'Reviewed with decision',
    accessor: 'reviewed_with_decision',
  },
];

/** columns for Namibia IRS focus (spray) areas */
export const zambiaMDALowerJurisdictions = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Registered Children Treated (%)',
    accessor: 'registeredchildrentreated_per',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Structures Visited (%)',
    accessor: 'structures_visited_per',
    sortType: 'basic',
  },
  {
    Header: '# Of Children Treated',
    accessor: 'n_events_where_pzqdistributed',
  },
  {
    Header: 'PZQ Tablets Distributed',
    accessor: 'total_pzqdistributed',
  },
];

export const zambiaMDAUpperJurisdictions = zambiaMDALowerJurisdictions.slice();
// add two columns after the first element in the array
zambiaMDAUpperJurisdictions.splice(
  1,
  0,
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Expected Children Found (%)',
    accessor: 'expectedchildren_found',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Expected Children Treated (%)',
    accessor: 'expectedchildren_treated',
    sortType: 'basic',
  }
);
/** columns for  smc point jurisdictions */
export const smcJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Operational Areas Visited',
    accessor: 'operational_areas_visited',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Distribution Effectiveness (%)',
    accessor: 'distribution_effectivness',
  },
  {
    Header: 'Total Structures',
    accessor: 'total_structures',
  },
  {
    Header: 'Total Found Structures',
    accessor: 'total_found_structures',
  },
  {
    Header: 'Total structures received SPAQ',
    accessor: 'total_structures_recieved_spaq',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage %',
    accessor: 'found_coverage',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Distribution Coverage %',
    accessor: 'distribution_coverage',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Treatment Coverage %',
    accessor: 'treatment_coverage',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Referral Treatment Rate %',
    accessor: 'referral_treatment_rate',
  },
];

/** IRS Table Columns
 * These are all the table columns for IRS that we know about.
 */
export const plansTableColumns: { [key: string]: Array<DrillDownColumn<Dictionary>> } = {
  irsLiteZambiaFocusArea2020: IRSLiteZambiaJurisdictionsColumns,
  irsLiteZambiaJurisdictions2020: IRSLiteZambiaJurisdictionsColumns,
  mdaJurisdictionsColumns,
  namibia2019: NamibiaColumns,
  smcJurisdictionsColumns,
  zambiaFocusArea2019: ZambiaFocusAreasColumns,
  zambiaJurisdictions2019: ZambiaJurisdictionsColumns,
  zambiaMDALower2020: zambiaMDALowerJurisdictions,
  zambiaMDAUpper2020: zambiaMDAUpperJurisdictions,
};

export type TableProps = Pick<
  DrillDownTableProps<Dictionary>,
  | 'columns'
  | 'CellComponent'
  | 'data'
  | 'extraCellProps'
  | 'getTdProps'
  | 'identifierField'
  | 'linkerField'
  | 'paginate'
  | 'parentIdentifierField'
  | 'resize'
  | 'rootParentId'
  | 'useDrillDown'
  | 'renderNullDataComponent'
  | 'hasChildren'
>;

export type GetColumnsToUse = (
  jurisdiction: GenericJurisdiction[],
  jurisdictionColumn: string,
  focusAreaColumn: string,
  focusAreaLevel: string,
  jurisdictionId: string | null
) => Array<DrillDownColumn<Dictionary<{}>>> | null;

/**
 * gets columns to be used
 * @param {GenericJurisdiction[]} jurisdiction - jurisdiction data
 * @param {string} jurisdictionColumn  - The reporting jurisdiction columns
 * @param {string} focusAreaColumn  - Reporting focus area column
 * @param {string} focusAreaLevel - Jurisdiction depth of the lowest level jurisdictions
 * @param {string} jurisdictionId - jurisdiction identifier
 */
export const getColumnsToUse: GetColumnsToUse = (
  jurisdiction: GenericJurisdiction[],
  jurisdictionColumn: string,
  focusAreaColumn: string,
  focusAreaLevel: string,
  jurisdictionId: string | null
) => {
  // we are finding the array of children jurisdictions that are not virtual
  const currLevelData = jurisdiction.filter(el => {
    if (el.jurisdiction_parent_id !== jurisdictionId) {
      return false;
    }
    if (el.hasOwnProperty('is_virtual_jurisdiction') && el.is_virtual_jurisdiction === true) {
      return false;
    }
    return true;
  });

  // Determine if this is a focus area level by checking if "is_leaf_node" exists and is true
  // Otherwise use the focusAreaLevel
  // TODO: remove focusAreaLevel once we fully transition to using "is_leaf_node"
  let isFocusArea: boolean = false;

  if (currLevelData.length > 0) {
    if (currLevelData[0].hasOwnProperty('is_leaf_node')) {
      isFocusArea = currLevelData[0].is_leaf_node;
    } else {
      isFocusArea = currLevelData[0].jurisdiction_depth >= +focusAreaLevel;
    }
  }

  return currLevelData && currLevelData.length > 0 && isFocusArea
    ? get(plansTableColumns, focusAreaColumn, null)
    : get(plansTableColumns, jurisdictionColumn, null);
};
