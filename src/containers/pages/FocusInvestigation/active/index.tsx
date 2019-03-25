// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import ElementMap from '@onaio/element-map';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { CellInfo } from 'react-table';
import 'react-table/react-table.css';
import { Table } from 'reactstrap';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import { ThailandClassifications } from '../../../../configs/fi';
import '../../../../helpers/tables.css';
import { FlexObject, RouteParams } from '../../../../helpers/utils';
import { data } from './tests/fixtures';

/** Reporting for Active Focus Investigations */
class ActiveFocusInvestigation extends React.Component<RouteComponentProps<RouteParams>, {}> {
  constructor(props: RouteComponentProps<RouteParams>) {
    super(props);
  }

  public renderRow(rowObject: FlexObject) {
    return (
      <tr key={rowObject.code}>
        <ElementMap items={[rowObject.code, rowObject.name, rowObject.description]} HTMLTag="td" />
      </tr>
    );
  }

  public render() {
    const tableProps = {
      CellComponent: DrillDownTableLinkedCell,
      columns: [
        {
          Header: 'Province',
          columns: [
            {
              Header: '',
              accessor: 'province',
            },
          ],
        },
        {
          Header: 'District',
          columns: [
            {
              Header: '',
              accessor: 'district',
            },
          ],
        },
        {
          Header: 'Canton',
          columns: [
            {
              Header: '',
              accessor: 'canton',
            },
          ],
        },
        {
          Header: 'Village',
          columns: [
            {
              Header: '',
              accessor: 'village',
            },
          ],
        },
        {
          Header: 'Focus Area',
          columns: [
            {
              Cell: (cell: CellInfo) => {
                return (
                  <div>
                    <a href="#map">
                      <FontAwesomeIcon icon={['fas', 'map']} />
                    </a>
                    &nbsp;&nbsp;
                    <a href="#focusarea">{cell.value}</a>
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
              Header: '1',
              accessor: 'adherence1',
              maxWidth: 55,
            },
            {
              Header: '3',
              accessor: 'adherence3',
              maxWidth: 55,
            },
            {
              Header: '7',
              accessor: 'adherence7',
              maxWidth: 55,
            },
          ],
        },
      ],
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
        <DrillDownTable {...tableProps} />
        <h5 className="mt-5">Definitions</h5>
        <Table className="definitions">
          <tbody>{ThailandClassifications.map(el => this.renderRow(el))}</tbody>
        </Table>
      </div>
    );
  }
}

export default ActiveFocusInvestigation;
