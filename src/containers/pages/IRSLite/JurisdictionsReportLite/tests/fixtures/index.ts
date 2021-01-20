import { DrillDownColumn } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { Cell } from 'react-table';
import { getIRSLiteThresholdAdherenceIndicator } from '../../../../../../helpers/indicators';

/* tslint:disable no-var-requires */
export const ZambiaJurisdictionsJSON = require('./zambia_jurisdictions.json');
export const ZambiaFocusAreasJSON = require('./zambia_focus_areas.json');
export const ZambiaStructuresJSON = require('./zambia_structures.json');
export const ZambiaJurisdictionsGeojsonJSON = require('./zambia_jurisdictions_geojson.json');

export const ZambiaFocusAreasColumns: Array<DrillDownColumn<Dictionary>> = [
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
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Spray Coverage (Effectiveness)',
    accessor: 'spraycov',
  },
  {
    Header: 'Found Coverage',

    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),

    accessor: 'spraytarg',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Spray Success Rate (PMI SC)',
    accessor: 'spraysuccess',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Structures remaining to spray to reach 90% SE',
    accessor: 'structures_remaining_to_90_se',
  },
  {
    Header: 'Reviewed with decision',
    accessor: 'reviewed_with_decision',
  },
];

export const ZambiaJurisdictionsColumns: Array<DrillDownColumn<Dictionary>> = [
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
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: '% Targeted Structures Sprayed',
    accessor: 'spraycovtarg',
  },
  {
    Header: 'Structures Found',
    accessor: 'found',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Success Rate',
    accessor: 'spraysuccess',
  },
];

export const mdaPointColumns = [
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
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'MMA Coverage (%)',
    accessor: 'mmacovper',
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
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'ADR Reported (%)',
    accessor: 'mmaadr',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'ADR Severe (%)',
    accessor: 'mmaadrsev',
  },
  {
    Header: 'Alb Tablets Distributed',
    accessor: 'albdist',
  },
];
/* tslint:enable no-var-requires */
