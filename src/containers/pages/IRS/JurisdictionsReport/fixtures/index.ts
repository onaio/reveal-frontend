import { DrillDownColumn } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { Cell } from 'react-table';
import {
  getIRSThresholdAdherenceIndicator,
  renderPercentage,
} from '../../../../../helpers/indicators';

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
    // headerClassName: 'centered',
  },
];

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
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray Coverage (Effectiveness)',
    accessor: 'spraycov',
    sortType: 'basic',
  },
  {
    Header: 'Found Coverage',

    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),

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
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Structures remaining to spray to reach 90% SE',
    accessor: 'structures_remaining_to_90_se',
    sortType: 'basic',
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
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'ADR Reported (%)',
    accessor: 'mmaadr',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'ADR Severe (%)',
    accessor: 'mmaadrsev',
    sortType: 'basic',
  },
  {
    Header: 'Alb Tablets Distributed',
    accessor: 'albdist',
  },
];
/* tslint:enable no-var-requires */
