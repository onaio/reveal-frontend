// this is the FocusInvestigation "historical" page component
import DrillDownTable from '@onaio/drill-down-table';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { CellInfo } from 'react-table';
import 'react-table/react-table.css';
import { Table } from 'reactstrap';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import ResponseAdherence from '../../../../components/formatting/ResponseAdherence';
import NotFound from '../../../../components/NotFound';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { ThailandClassifications } from '../../../../configs/fi';
import { FI_URL, FOCUS_INVESTIGATIONS, HOME, HOME_URL, PROVINCE } from '../../../../constants';
import { getFIAdherencendicator, renderClassificationRow } from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import { FlexObject, percentage, RouteParams } from '../../../../helpers/utils';
import { data } from './tests/fixtures';

/** State interface */
interface State {
  id?: string;
}

/** Historical data reporting for Focus Investigations */
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
    let locationLabel: string = PROVINCE;
    let pageTitle: string = FOCUS_INVESTIGATIONS;
    const baseFIPage = {
      label: FOCUS_INVESTIGATIONS,
      url: `${FI_URL}`,
    };
    const breadcrumbProps = {
      currentPage: baseFIPage,
      pages: [
        {
          label: HOME,
          url: HOME_URL,
        },
      ],
    };
    const { id } = this.state;
    if (id !== undefined) {
      const theObject = data.filter((el: FlexObject) => el.name === id);
      if (theObject.length < 1) {
        return <NotFound />;
      }

      pageTitle = `${pageTitle} in ${theObject[0].name}`;

      // deal with breadcrumbs
      breadcrumbProps.pages.push(baseFIPage);

      if (theObject[0].parent !== null) {
        const theTree = this.getTree(data, theObject[0]);
        theTree.reverse();
        const pages = theTree.map(el => {
          return {
            label: el.name,
            url: `${FI_URL}/${el.name}`,
          };
        });
        const newPages = breadcrumbProps.pages.concat(pages);
        breadcrumbProps.pages = newPages;
      }

      const currentPage = {
        label: theObject[0].name,
        url: `${FI_URL}/${theObject[0].name}`,
      };
      breadcrumbProps.currentPage = currentPage;
    }

    const currLevelData = data.filter(el => el.parent === id);

    if (currLevelData.length > 0) {
      locationLabel = currLevelData[0].type;
    }

    const tableProps = {
      CellComponent: DrillDownTableLinkedCell,
      columns: [
        {
          Header: locationLabel,
          className: 'centered',
          columns: [
            {
              Header: '',
              accessor: 'name',
            },
          ],
        },
        {
          Header: 'Mapped Foci Areas',
          className: 'centered',
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
          className: 'centered',
          columns: [
            {
              Header: 'Number',
              accessor: 'Number',
              className: 'centered',
            },
            {
              Cell: (cell: CellInfo) => percentage(cell.value),
              Header: '%',
              accessor: '%',
              className: 'centered indicator',
            },
          ],
        },
        {
          Header: 'FI response',
          className: 'centered',
          columns: [
            {
              Cell: (cell: CellInfo) => getFIAdherencendicator(cell),
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

    if (currLevelData.length > 0 && currLevelData[0].type === 'Foci Area') {
      tableProps.columns = [
        {
          Header: locationLabel,
          className: 'centered',
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
          className: 'centered',
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
          className: 'centered',
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
          className: 'centered',
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
        <h3 className="mb-3 page-title">{pageTitle}</h3>
        <div>
          <DrillDownTable {...tableProps} />
          <h5 className="mt-5">Definitions</h5>
          <Table className="definitions">
            <tbody>{ThailandClassifications.map(el => renderClassificationRow(el))}</tbody>
          </Table>
          {currLevelData.length > 0 && currLevelData[0].type === 'Foci Area' ? (
            ''
          ) : (
            <ResponseAdherence />
          )}
        </div>
      </div>
    );
  }
}

export default HistoricalFocusInvestigation;
