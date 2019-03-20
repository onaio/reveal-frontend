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
import { FOCUS_INVESTIGATION_URL } from '../../../../constants';
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
    } else {
      if (prevId !== undefined) {
        // if we get in here it means the `id` variable in state needs to be reset
        this.setState({ id: undefined });
      }
    }
  }

  public getTree(tree: FlexObject[], item: FlexObject, result: FlexObject[] = []): FlexObject[] {
    if (item.parent === null && !result.includes(item)) {
      result.push(item);
    } else {
      const parentItems = tree.filter(el => el.name === item.parent);
      if (parentItems.length > 0) {
        if (!result.includes(parentItems[0])) {
          result.push(parentItems[0]);
        }
        return this.getTree(tree, parentItems[0], result);
      }
    }
    return result;
  }

  public render() {
    const baseFIPage = {
      label: 'Focus Investigation',
      url: `${FOCUS_INVESTIGATION_URL}`,
    };
    const breadcrumbProps = {
      currentPage: baseFIPage,
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    };
    const { id } = this.state;
    if (id !== undefined) {
      const theObject = data.filter((el: FlexObject) => el.name === id);
      if (theObject.length < 1) {
        return <NotFound />;
      }
      breadcrumbProps.pages.push(baseFIPage);
      if (theObject[0].parent !== null) {
        const theTree = this.getTree(data, theObject[0]);
        theTree.reverse();
        const pages = theTree.map(el => {
          return {
            label: el.name,
            url: `${FOCUS_INVESTIGATION_URL}/${el.name}`,
          };
        });
        const newPages = breadcrumbProps.pages.concat(pages);
        breadcrumbProps.pages = newPages;
      }

      const currentPage = {
        label: theObject[0].name,
        url: `${FOCUS_INVESTIGATION_URL}/${theObject[0].name}`,
      };
      breadcrumbProps.currentPage = currentPage;
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
