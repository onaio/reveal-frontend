// this is the FocusInvestigation page component
import DrillDownTable from '@onaio/drill-down-table';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo } from 'react-table';
import NotFound from '../../../../components/NotFound';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { FOCUS_INVESTIGATION_URL } from '../../../../constants';
import { getTableCellIndicator } from '../../../../helpers/indicators';
import { FlexObject } from '../../../../helpers/utils';
import { data } from './tests/fixtures';

/** Route params interface */
interface RouteParams {
  id: string;
}

/** Historical data reporting for Focus Investigation */
class HistoricalFocusInvestigation extends React.Component<RouteComponentProps<RouteParams>, {}> {
  constructor(props: RouteComponentProps<RouteParams>) {
    super(props);
  }

  public render() {
    const id = this.props.match.params.id;
    if (id !== undefined) {
      const theObject = data.filter((el: FlexObject) => el.name === id);

      if (theObject.length < 1) {
        return <NotFound />;
      }
    }

    const tableProps = {
      className: 'table',
      columns: [
        {
          Header: 'Location',
          columns: [
            {
              Cell: (cell: CellInfo) => {
                return <Link to={`${FOCUS_INVESTIGATION_URL}/${cell.value}`}>{cell.value}</Link>;
              },
              Header: '',
              accessor: 'name',
            },
          ],
        },
        {
          Header: 'Mapped Foci Areas',
          columns: [
            {
              Header: 'Total',
              accessor: 'Total',
            },
            {
              Header: 'A1',
              accessor: 'A1',
            },
            {
              Header: 'A2',
              accessor: 'A2',
            },
            {
              Header: 'B1',
              accessor: 'B1',
            },
            {
              Header: 'B2',
              accessor: 'B2',
            },
          ],
        },
        {
          Header: 'A1 screened twice in last year',
          columns: [
            {
              Header: 'Number',
              accessor: 'Number',
            },
            {
              Cell: (cell: CellInfo) => getTableCellIndicator(cell),
              Header: '%',
              accessor: '%',
            },
          ],
        },
        {
          Header: 'FI response',
          columns: [
            {
              Cell: (cell: CellInfo) => getTableCellIndicator(cell),
              Header: 'adherence',
              accessor: 'Adherence',
            },
          ],
        },
      ],
      data,
      identifierField: 'name',
      linkerField: 'name',
      minRows: 0,
      parentIdentifierField: 'parent',
      rootParentId: id || null,
      showPageSizeOptions: false,
      showPagination: false,
    };
    return (
      <div>
        <HeaderBreadcrumb />
        <div>
          <DrillDownTable {...tableProps} />
        </div>
      </div>
    );
  }
}

export default HistoricalFocusInvestigation;
