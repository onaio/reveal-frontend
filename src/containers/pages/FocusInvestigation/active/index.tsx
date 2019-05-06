// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import 'react-table/react-table.css';
import { Table } from 'reactstrap';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import OneThreeSevenAdherence from '../../../../components/formatting/OneThreeSevenAdherence';
import { FIClassifications, locationHierarchy } from '../../../../configs/settings';
import { FI_SINGLE_MAP_URL, FI_SINGLE_URL } from '../../../../constants';
import {
  get137AdherenceIndicator,
  get137Value,
  renderClassificationRow,
} from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import { getLocationColumns, RouteParams } from '../../../../helpers/utils';
import { data } from './tests/fixtures';

/** Reporting for Active Focus Investigations */
class ActiveFocusInvestigation extends React.Component<RouteComponentProps<RouteParams>, {}> {
  constructor(props: RouteComponentProps<RouteParams>) {
    super(props);
  }

  public render() {
    const locationColumns: Column[] = getLocationColumns(locationHierarchy, true);
    const otherColumns: Column[] = [
      {
        Header: 'Focus Area',
        columns: [
          {
            Cell: (cell: CellInfo) => {
              return (
                <div>
                  <Link to={`${FI_SINGLE_MAP_URL}/13`}>
                    <FontAwesomeIcon icon={['fas', 'map']} />
                  </Link>
                  &nbsp;&nbsp;
                  <Link to={`${FI_SINGLE_URL}/13`}>{cell.value}</Link>
                </div>
              );
            },
            Header: '',
            accessor: 'focusArea',
            minWidth: 130,
          },
        ],
      },
      {
        Header: 'Case Notif. Date',
        columns: [
          {
            Cell: (cell: CellInfo) => {
              return (
                <div>
                  <a href="#date">{cell.value}</a>
                </div>
              );
            },
            Header: '',
            accessor: 'caseNotificationDate',
            minWidth: 120,
          },
        ],
      },
      {
        Header: 'Status',
        columns: [
          {
            Header: '',
            accessor: 'status',
            maxWidth: 60,
          },
        ],
      },
      {
        Header: 'Case Class.',
        columns: [
          {
            Header: '',
            accessor: 'caseClassification',
          },
        ],
      },
      {
        Header: '1-3-7 adherence',
        columns: [
          {
            Cell: (cell: CellInfo) => get137Value(cell.value),
            Header: '1',
            accessor: 'adherence1',
            maxWidth: 40,
          },
          {
            Cell: (cell: CellInfo) => get137Value(cell.value),
            Header: '3',
            accessor: 'adherence3',
            maxWidth: 40,
          },
          {
            Cell: (cell: CellInfo) => get137AdherenceIndicator(cell),
            Header: '7',
            accessor: 'adherence7',
            maxWidth: 105,
          },
        ],
      },
    ];
    const allColumns: Column[] = locationColumns.concat(otherColumns);

    const tableProps = {
      CellComponent: DrillDownTableLinkedCell,
      columns: allColumns,
      data,
      identifierField: 'id',
      linkerField: 'id',
      minRows: 0,
      parentIdentifierField: 'parent',
      rootParentId: null,
      showPageSizeOptions: false,
      showPagination: false,
      useDrillDownTrProps: false,
    };

    return (
      <div>
        <h3 className="mb-3 mt-5 page-title">Active Focus Investigations</h3>
        <DrillDownTable {...tableProps} />
        <h5 className="mt-5">Definitions</h5>
        <Table className="definitions">
          <tbody>{FIClassifications.map(el => renderClassificationRow(el))}</tbody>
        </Table>
        <OneThreeSevenAdherence />
      </div>
    );
  }
}

export default ActiveFocusInvestigation;
