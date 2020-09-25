import { DropDownCellProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { ceil, get } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import { renderPercentage } from '../../../../../helpers/indicators';
import { GenericJurisdiction } from '../../../../../store/ducks/generic/jurisdictions';
import { friendlyDate } from '../../../../../store/ducks/opensrp/events/utils';

/** focus Areas mop-up reporting columns */
export const ZambiaIRSMopupFocusArea = [
  {
    Header: 'Health Facility',
    accessor: 'jurisdiction_name',
  },
  {
    Header: 'Spray Area',
    accessor: 'health_center_jurisdiction_name',
  },
  {
    Header: 'Structures on Ground',
    accessor: 'totstruct',
  },
  {
    Header: 'Visited Sprayed',
    accessor: 'sprayedstruct',
  },
  {
    Cell: ({ value }: Cell) => ceil(value),
    Header: 'Structures remaining to spray to reach 90% SE',
    accessor: 'structures_remaining_to_90_se',
  },
  { Cell: ({ value }: Cell) => ceil(value), Header: 'TLA Days', accessor: 'tla_days_to_90_se' },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Spray Effectiveness',
    accessor: 'spray_effectiveness',
  },
  { Cell: (cell: Cell) => renderPercentage(cell), Header: 'Found coverage', accessor: 'spraytarg' },
  { Cell: (cell: Cell) => renderPercentage(cell), Header: 'Spray coverage', accessor: 'spraycov' },
  {
    Cell: ({ value }: Cell) => friendlyDate(value),
    Header: 'Date of Last Visit',
    accessor: 'latest_spray_event_date',
  },
  {
    Cell: ({ value }: Cell) => friendlyDate(value),
    Header: 'Date of last Decision form',
    accessor: 'latest_sa_event_date',
  },
];

export const zambiaMopupJurisdiction = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
  },
  {
    Header: 'Health Centers to Mop-up',
    accessor: 'num_health_centers_below_90_se',
  },
  {
    Header: 'Spray Areas to to Mop-up',
    accessor: 'num_spray_areas_below_90_se',
  },
  {
    Header: 'Structures to spray or areas to react 90%',
    accessor: 'structures_remaining_to_90_se',
  },
  {
    Cell: ({ value }: Cell) => ceil(value),
    Header: 'TLA days needed for areas needed to reach 90%',
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
