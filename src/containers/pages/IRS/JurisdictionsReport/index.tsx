// this is the FocusInvestigation "historical" page component
import DrillDownTable from '@onaio/drill-down-table';
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

export interface IRSJurisdictionProps {
  country: string;
}

/** Renders IRS Jurisdictions reports */
const IRSJurisdictions = (props: IRSJurisdictionProps & RouteComponentProps<RouteParams>) => {
  return <div>xx</div>;
};

const defaultProps: IRSJurisdictionProps = {
  country: 'Namibia',
};

IRSJurisdictions.defaultProps = defaultProps;

export { IRSJurisdictions };
