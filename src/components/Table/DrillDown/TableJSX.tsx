import { Dictionary } from '@onaio/utils';
import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Cell,
  Column,
  ColumnInstance,
  Row,
  usePagination,
  UsePaginationInstanceProps,
  useSortBy,
  UseSortByColumnProps,
  useTable,
  UseTableHeaderGroupProps,
  UseTableOptions,
} from 'react-table';
import { rowHeights } from '../../../configs/settings';
import { ROW_HEIGHT_KEY } from '../../../constants';
import { ID, NO_DATA_FOUND, PARENT_ID, ROOT_PARENT_ID } from './helpers/constants';
import { renderPaginationFun } from './helpers/Pagination/pagination';
import { SortIcon } from './helpers/SortIcon/sortIcon';

/** Type definition for hasChildrenFunc */
export type HasChildrenFuncType = <D extends object>(
  cellObject: Cell<D>,
  parentIdList: number[] | string[],
  idField: string | number
) => boolean;

/** Check if a Cell  is part of a row whose data entry can be considered to have children */
export function hasChildrenFunc<D extends object>(
  cellObject: Cell<D>,
  parentIdList: Array<number | string>,
  idField: string | number = 'id'
) {
  return parentIdList.includes((cellObject.row.original as Dictionary)[idField]);
}

/** props for render Prop used to render filters in the top filter bar */
export interface RenderFiltersInBarOptions {
  setRowHeight: Dispatch<SetStateAction<string>>;
}

/** the custom default options that will be given to a render prop that renders the pagination */
export interface RenderPaginationOptions<T extends object> extends UsePaginationInstanceProps<T> {
  pageSize: number;
  pageIndex: number;
}

/** describes props for the underlying Table component */
export interface TableJSXProps<TData extends object> {
  columns: Array<Column<TData>>;
  data: TData[];
  fetchData: (options: Dictionary) => void;
  identifierField: string;
  parentNodes: Array<string | number>;
  parentIdentifierField: string;
  hasChildren: HasChildrenFuncType;
  showBottomPagination: boolean;
  renderPagination: (props: RenderPaginationOptions<TData>) => React.ElementType;
  showTopPagination: boolean;
  renderFilterBar: true;
  renderInFilterBar: (prop: RenderFiltersInBarOptions) => React.ElementType;
  rootParentId: string;
  renderNullDataComponent: () => React.ElementType;
  linkerField?: string;
  useDrillDown: boolean /** whether component can act as a normal table */;
}

/** default props for TableJSX */
export const defaultTableProps = {
  hasChildren: hasChildrenFunc,
  identifierField: ID,
  linkerField: ID,
  parentIdentifierField: PARENT_ID,
  renderFilterBar: true,
  renderInFilterBar: () => null,
  renderNullDataComponent: () => (
    <div className="jumbotron">
      <p>{NO_DATA_FOUND}</p>
    </div>
  ),
  renderPagination: renderPaginationFun,
  rootParentId: ROOT_PARENT_ID,
  rowHeight: rowHeights.DEFAULT.value,
  showBottomPagination: true,
  showTopPagination: true,
  useDrillDown: true,
};

/** the underlying Table component
 * its seprarate since we want to control some of its aspects, specifically pagination
 */
function Table<D extends object>(props: TableJSXProps<D>) {
  const { columns, data, fetchData, identifierField } = props;

  const skipPageResetRef = React.useRef<boolean>();
  const defaultRowHeight = window.localStorage.getItem(ROW_HEIGHT_KEY) || rowHeights.DEFAULT.value;
  const [rHeight, setRowHeight] = React.useState<string>(defaultRowHeight);
  const [currentParentId, setCurrentParentId] = useState<string>(props.rootParentId);

  /** describe the column instance after including hooks. */
  interface ActualColumnInstance<T extends object>
    extends ColumnInstance<T>,
      UseSortByColumnProps<T>,
      UsePaginationInstanceProps<T> {}

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    page,
    state: { pageIndex, pageSize },
  }: Dictionary = useTable(
    {
      // prevent the table from auto resetting when we change our data source,
      // for instance if we were to change the data prop dynamically in the controlling component
      autoResetPage: !skipPageResetRef.current,
      autoResetSortBy: !skipPageResetRef.current,
      columns,
      data,
      initialState: { pageIndex: 0 },
    } as UseTableOptions<D>,
    useSortBy,
    usePagination
  );

  React.useEffect(() => {
    // data passed to this component is controlled by the component that defines fetchData.
    // the controllign component filters the data based onthe current parent id and then passes it
    // on down to this component as the data prop.
    fetchData({ skipPageResetRef, currentParentId });
    skipPageResetRef.current = false;
  }, [fetchData, currentParentId]);

  return (
    <div className="table-container mb-3">
      <div className="row">
        {props.renderFilterBar && (
          <div className="col">
            {props.renderInFilterBar({ setRowHeight })}
            {props.showTopPagination &&
              props.renderPagination({
                canNextPage,
                canPreviousPage,
                gotoPage,
                nextPage,
                page,
                pageCount,
                pageIndex,
                pageOptions,
                pageSize,
                previousPage,
                setPageSize,
              })}
          </div>
        )}
      </div>
      <table className="table table-striped table-bordered drill-down-table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup: UseTableHeaderGroupProps<D>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((c: ColumnInstance<D>, index: number) => {
                const column = (c as unknown) as ActualColumnInstance<D>;
                return (
                  <th
                    key={`thead-th-${index}`}
                    // Return an array of prop objects and react-table will merge them appropriately
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render('Header')}
                    {column.canSort && (
                      <SortIcon isSorted={column.isSorted} isSortedDesc={column.isSortedDesc} />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        {data.length > 0 && (
          <tbody {...getTableBodyProps([{ style: { lineHeight: rHeight } }])}>
            {page.map((row: Row<D>, idx: number) => {
              prepareRow(row);
              return (
                // Merge user row props in
                <tr key={`tbody-tr-${idx}`} {...row.getRowProps()}>
                  {row.cells.map((cell: Cell<D>, i: number) => {
                    return (
                      <td
                        key={`td-${i}`}
                        // Return an array of prop objects and react-table will merge them appropriately
                        {...cell.getCellProps([
                          {
                            // onclickHandler updates the curentParentId, i.e if the clicked on cell has children
                            onClick: (e: React.MouseEvent<HTMLElement>) => {
                              e.stopPropagation();
                              // onClick will be effective only when drilldingDown and if columnId is the same as linkerField
                              if (!(props.useDrillDown && cell.column.id === props.linkerField)) {
                                return;
                              }
                              if (props.identifierField && props.parentIdentifierField) {
                                if (
                                  props.hasChildren &&
                                  hasChildrenFunc<D>(cell, props.parentNodes, props.identifierField)
                                ) {
                                  const newParentId: string = (row.original as Dictionary)[
                                    identifierField
                                  ];
                                  setCurrentParentId(newParentId);
                                }
                              }
                            },
                          },
                        ] as any)}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        )}
      </table>
      {data.length === 0 && props.renderNullDataComponent()}
      <div className="row">
        <div className="col">
          {props.showBottomPagination &&
            props.renderPagination({
              canNextPage,
              canPreviousPage,
              gotoPage,
              nextPage,
              page,
              pageCount,
              pageIndex,
              pageOptions,
              pageSize,
              previousPage,
              setPageSize,
            })}
        </div>
      </div>
    </div>
  );
}

Table.defaultProps = defaultTableProps;
export { Table };
