// this is the FocusInvestigation "historical" page component
import DrillDownTable from '@onaio/drill-down-table';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { CellInfo } from 'react-table';
import 'react-table/react-table.css';
import { Table } from 'reactstrap';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import ResponseAdherence from '../../../../components/formatting/ResponseAdherence';
import NotFound from '../../../../components/NotFound';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { FIClassifications } from '../../../../configs/settings';
import { HOME, HOME_URL, IRS_PLANS, IRS_REPORTS_URL } from '../../../../constants';
import { getFIAdherenceIndicator, renderClassificationRow } from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import { FlexObject, percentage, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import * as fixtures from './tests/fixtures';

export interface IRSJurisdictionProps {
  service: typeof supersetFetch;
}

const data = superset.processData(fixtures.supersetJSON) || [];
// const data = [];
const x = fixtures.supersetJSON;
// debugger;

/** Renders IRS Jurisdictions reports */
const IRSJurisdictions = (props: IRSJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const id = null;

  const tableProps = {
    CellComponent: DrillDownTableLinkedCell,
    columns: [
      {
        Header: 'Name',
        accessor: 'jurisdiction_name',
        // className: 'centered',
      },
      {
        Header: 'Found',
        accessor: 'structuresfound',
        // className: 'centered',
      },
      {
        Header: 'Sprayed',
        accessor: 'structuressprayed',
        // className: 'centered',
      },
    ],
    data,
    extraCellProps: { urlPath: 'xxx' },
    identifierField: 'jurisdiction_id',
    linkerField: 'jurisdiction_name',
    minRows: 10,
    parentIdentifierField: 'jurisdiction_parent_id',
    rootParentId: '',
    shouldUseEffect: false,
    // showPageSizeOptions: true,
    // showPagination: true,
    useDrillDownTrProps: true,
  };

  return (
    <div>
      <DrillDownTable {...tableProps} />
    </div>
  );
};

const defaultProps: IRSJurisdictionProps = {
  service: supersetFetch,
};

IRSJurisdictions.defaultProps = defaultProps;

export { IRSJurisdictions };
