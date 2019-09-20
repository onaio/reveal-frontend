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

const data = superset.processData(JSON.parse(fixtures.supersetJSON)) || [];

/** Renders IRS Jurisdictions reports */
const IRSJurisdictions = (props: IRSJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const id = null;

  const tableProps = {
    CellComponent: DrillDownTableLinkedCell,
    data,
    extraCellProps: { urlPath: IRS_REPORTS_URL },
    identifierField: 'jurisdiction_name',
    linkerField: 'jurisdiction_name',
    minRows: 0,
    parentIdentifierField: 'jurisdiction_parent_id',
    rootParentId: id || null,
    shouldUseEffect: true,
    showPageSizeOptions: true,
    showPagination: true,
    useDrillDownTrProps: false,
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
