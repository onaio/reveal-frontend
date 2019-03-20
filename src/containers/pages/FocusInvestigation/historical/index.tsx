// this is the FocusInvestigation page component
import DrillDownTable from '@onaio/drill-down-table';
import { Location } from 'history';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { CellInfo } from 'react-table';
import 'react-table/react-table.css';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import NotFound from '../../../../components/NotFound';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { getTableCellIndicator } from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import { FlexObject } from '../../../../helpers/utils';
import { data } from './tests/fixtures';

/** Route params interface */
interface RouteParams {
  id?: string;
}

/** State interface */
interface State {
  id?: string;
}

/** Historical data reporting for Focus Investigation */
class HistoricalFocusInvestigation extends React.Component<
  RouteComponentProps<RouteParams>,
  State
> {
  constructor(props: RouteComponentProps<RouteParams>) {
    super(props);
    if (this.props.match && this.props.match.params && this.props.match.params.id) {
      this.state = {
        id: this.props.match.params.id,
      };
    } else {
      this.state = {};
    }
  }

  public componentDidUpdate() {
    const { id: prevId } = this.state;
    if (this.props.match && this.props.match.params && this.props.match.params.id) {
      const id = this.props.match.params.id;

      if (id !== prevId) {
        this.setState({ id });
      }
    }
  }

  public render() {
    const { id } = this.state;
    if (id !== undefined) {
      const theObject = data.filter((el: FlexObject) => el.name === id);
      if (theObject.length < 1) {
        return <NotFound />;
      }
    }

    const tableProps = {
      CellComponent: DrillDownTableLinkedCell,
      columns: [
        {
          Header: 'Location',
          columns: [
            {
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
              className: 'centered',
            },
            {
              Header: 'A1',
              accessor: 'A1',
              className: 'centered',
            },
            {
              Header: 'A2',
              accessor: 'A2',
              className: 'centered',
            },
            {
              Header: 'B1',
              accessor: 'B1',
              className: 'centered',
            },
            {
              Header: 'B2',
              accessor: 'B2',
              className: 'centered',
            },
          ],
        },
        {
          Header: 'A1 screened twice in last year',
          columns: [
            {
              Header: 'Number',
              accessor: 'Number',
              className: 'centered',
            },
            {
              Cell: (cell: CellInfo) => getTableCellIndicator(cell),
              Header: '%',
              accessor: '%',
              className: 'centered indicator',
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
              className: 'centered indicator',
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
      useDrillDownTrProps: false,
    };

    const currLevelData = data.filter(el => el.parent === id);

    if (currLevelData.length > 0 && currLevelData[0].type === 'Foci Area') {
      tableProps.columns = [
        {
          Header: 'Location',
          columns: [
            {
              Header: '',
              accessor: 'name',
              className: 'centered',
            },
          ],
        },
        {
          Header: 'Status',
          columns: [
            {
              Header: '',
              accessor: 'status',
              className: 'centered',
            },
          ],
        },
        {
          Header: 'Last Visit',
          columns: [
            {
              Header: '',
              accessor: 'lastVisit',
              className: 'centered',
            },
          ],
        },
        {
          Header: 'FI response',
          columns: [
            {
              Header: 'adherence',
              accessor: 'Adherence',
              className: 'centered',
            },
          ],
        },
      ];
    }

    const breadcrumbProps = {
      currentPage: {
        label: 'Focus Investigation',
        url: '/focus',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    };

    return (
      <div>
        <HeaderBreadcrumb {...breadcrumbProps} />
        <div>
          <DrillDownTable {...tableProps} />
        </div>
      </div>
    );
  }
}

export default HistoricalFocusInvestigation;
