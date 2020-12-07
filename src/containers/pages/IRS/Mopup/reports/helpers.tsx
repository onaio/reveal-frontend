import { DropDownCellProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { ceil, get } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import {
  DATE_OF_LAST_DECISION_FROM,
  DATE_OF_LAST_VISIT,
  FOUND_COVERAGE,
  HEALTH_CENTERS_TO_MOP_UP,
  HEALTH_FACILITY,
  NAME,
  NO_DECISION_FORM,
  NOT_VISITED,
  SPRAY_AREA_HEADER,
  SPRAY_AREAS_TO_MOPUP,
  SPRAY_COVERAGE,
  SPRAY_EFFECTIVENESS,
  STRUCTURES_ON_GROUND,
  STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE,
  STRUCTURES_TO_SPRAY_TO_REACH_90,
  TLA_DAYS,
  TLA_DAYS_AREAS_TO_REACH_90,
  VISITED_SPRAYED,
} from '../../../../../configs/lang';
import { renderPercentage } from '../../../../../helpers/indicators';
import { formatDates } from '../../../../../helpers/utils';
import { GenericJurisdiction } from '../../../../../store/ducks/generic/jurisdictions';

/** focus Areas mop-up reporting columns */
export const ZambiaIRSMopupFocusArea = [
  {
    Header: HEALTH_FACILITY,
    accessor: 'jurisdiction_name',
  },
  {
    Header: SPRAY_AREA_HEADER,
    accessor: 'health_center_jurisdiction_name',
  },
  {
    Header: STRUCTURES_ON_GROUND,
    accessor: 'totstruct',
  },
  {
    Header: VISITED_SPRAYED,
    accessor: 'sprayedstruct',
  },
  {
    Cell: ({ value }: Cell) => ceil(value),
    Header: STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE,
    accessor: 'structures_remaining_to_90_se',
  },
  { Cell: ({ value }: Cell) => ceil(value), Header: TLA_DAYS, accessor: 'tla_days_to_90_se' },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: SPRAY_EFFECTIVENESS,
    accessor: 'spray_effectiveness',
  },
  { Cell: (cell: Cell) => renderPercentage(cell), Header: FOUND_COVERAGE, accessor: 'spraytarg' },
  { Cell: (cell: Cell) => renderPercentage(cell), Header: SPRAY_COVERAGE, accessor: 'spraycov' },
  {
    Cell: ({ value }: Cell) => formatDates(value, 'DD-MMM', NOT_VISITED),
    Header: DATE_OF_LAST_VISIT,
    accessor: 'latest_spray_event_date',
  },
  {
    Cell: ({ value }: Cell) => formatDates(value, 'DD-MMM', NO_DECISION_FORM),
    Header: DATE_OF_LAST_DECISION_FROM,
    accessor: 'latest_sa_event_date',
  },
];

export const zambiaMopupJurisdiction = [
  {
    Header: NAME,
    accessor: 'jurisdiction_name',
  },
  {
    Header: HEALTH_CENTERS_TO_MOP_UP,
    accessor: 'num_health_centers_below_90_se',
  },
  {
    Header: SPRAY_AREAS_TO_MOPUP,
    accessor: 'num_spray_areas_below_90_se',
  },
  {
    Header: STRUCTURES_TO_SPRAY_TO_REACH_90,
    accessor: 'structures_remaining_to_90_se',
  },
  {
    Cell: ({ value }: Cell) => ceil(value),
    Header: TLA_DAYS_AREAS_TO_REACH_90,
    accessor: 'tla_days_to_90_se',
  },
];

/** column definitions for IRS mopup reports */
const planTableColumnsLookup = {
  ZambiaIRSMopupFocusArea,
  zambiaMopupJurisdiction,
};

/**
 * gets columns to be used
 * @param {GenericJurisdiction[]} jurisdiction - jurisdiction data
 * @param {string} jurisdictionColumn  - The reporting jurisdiction columns
 * @param {string} focusAreaColumn  - Reporting focus area column
 * @param {string} focusAreaLevel - Jurisdiction depth of the lowest level jurisdictions
 * @param {string} jurisdictionId - jurisdiction identifier
 */
export const getColumns = (
  jurisdiction: GenericJurisdiction[],
  jurisdictionColumn: string,
  focusAreaColumn: string,
  focusAreaLevel: string,
  jurisdictionId: string | null
) => {
  const currentParent = jurisdiction.filter(el => el.jurisdiction_id === jurisdictionId);
  return currentParent &&
    currentParent.length > 0 &&
    currentParent[0].jurisdiction_depth >= +focusAreaLevel
    ? get(planTableColumnsLookup, focusAreaColumn, null)
    : get(planTableColumnsLookup, jurisdictionColumn, null);
};

/** Interface for linked cell props */
export interface LinkedCellProps extends DropDownCellProps {
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
export const IRSMopupTableCell: React.ElementType<LinkedCellProps> = (props: LinkedCellProps) => {
  const { cell, cellValue, hasChildren, urlPath } = props;
  const original: Dictionary = cell.row.original;
  const url = urlPath ? `${urlPath}/${original.jurisdiction_id}` : '';
  return <div>{hasChildren ? <Link to={url}>{cellValue}</Link> : cellValue}</div>;
};
