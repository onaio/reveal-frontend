import { Dictionary } from '@onaio/utils';
import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Cell,
  ColumnInstance,
  Row,
  usePagination,
  UsePaginationInstanceProps,
  useSortBy,
  UseSortByColumnProps,
  useTable,
  UseTableHeaderGroupProps,
} from 'react-table';
import { rowHeights } from '../../../configs/settings';
import { ROW_HEIGHT_KEY } from '../../../constants';
import { ID, NO_DATA_FOUND, PARENT_ID } from './helpers/constants';
import { renderPaginationFun } from './helpers/Pagination/pagination';
import { SortIcon } from './helpers/SortIcon/sortIcon';

/** Type definition for hasChildrenFunc */
export type HasChildrenFuncType = (
  cellObject: Cell,
  parentIdList: number[] | string[],
  idField: string | number
) => boolean;

/** Check if a Cell  is part of a row whose data entry can be considered to have children */
export function hasChildrenFunc(
  cellObject: Cell,
  parentIdList: Array<number | string>,
  idField: string | number = 'id'
) {
  if (cellObject.row === undefined) {
    console.log(cellObject);
    // return false;
  }
  return parentIdList.includes((cellObject.row.original as Dictionary)[idField]);
}

export interface RenderFiltersInBarOptions {
  setRowHeight: Dispatch<SetStateAction<string>>;
}

export interface RenderPaginationOptions<T extends object> extends UsePaginationInstanceProps<T> {
  pageSize: number;
  pageIndex: number;
}

/** describes props for the underlying Table component */
export interface TableJSXProps<TData extends object> {
  columns: Array<ColumnInstance<TData>>;
  data: TData[];
  pgCount: number;
  fetchData: (options: Dictionary) => void;
  identifierField: string;
  parentNodes: Array<string | number>;
  parentIdentifierField: string;
  hasChildren: HasChildrenFuncType;
  showBottomPagination: boolean;
  renderPagination: (props: RenderPaginationOptions<TData>) => React.ElementType;
  showTopPagination: boolean;
  renderInFilterBar: (prop: RenderFiltersInBarOptions) => React.ElementType;
  rootParentId: string;
  renderNullDataComponent: () => React.ElementType;
}

const defaultTableProps = {
  hasChildren: hasChildrenFunc,
  identifierField: ID,
  parentIdentifierField: PARENT_ID,
  renderPagination: renderPaginationFun,
  showBottomPagination: true,
  rowHeight: rowHeights.DEFAULT.value,
  showTopPagination: true,
  renderInFilterBar: (props: any) => null,
  renderNullDataComponent: () => <h2>{NO_DATA_FOUND}</h2>,
};

/** the underlying Table component
 * its seprarate since we want to control some of its aspects, specifically pagination
 */
function Table<D extends object>(props: TableJSXProps<D>) {
  const { columns, data, pgCount, fetchData, identifierField } = props;

  const skipPageResetRef = React.useRef<boolean>();
  const defaultRowHeight = window.localStorage.getItem(ROW_HEIGHT_KEY) || rowHeights.DEFAULT.value;
  const [rHeight, setRowHeight] = React.useState<string>(defaultRowHeight);
  const [currentParentId, setCurrentParentId] = useState<string>(props.rootParentId);

  /** describe the column instance after including hooks. */
  interface ActualColumnInstance<D extends object>
    extends ColumnInstance<D>,
      UseSortByColumnProps<D>,
      UsePaginationInstanceProps<D> {}

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
      // manualPagination: true,
      // pageCount: pgCount,
    } as any,
    useSortBy,
    usePagination
  );

  React.useEffect(() => {
    fetchData({ pageSize, pageIndex, skipPageResetRef, currentParentId });
    skipPageResetRef.current = false;
  }, [fetchData, pageSize, pageIndex, currentParentId]);

  return (
    <div className="table-container mb-3">
      <div className="row">
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
        {data.length === 0 && props.renderNullDataComponent()}
        {data.length > 0 && (
          <tbody {...getTableBodyProps([{ style: { lineHeight: rHeight } }])}>
            {page.map((row: Row<D>, idx: number) => {
              prepareRow(row);
              return (
                // Merge user row props in
                <tr
                  key={`tbody-tr-${idx}`}
                  {...row.getRowProps([
                    {
                      onClick: (cell: Cell) => {
                        if (props.identifierField && props.parentIdentifierField) {
                          if (
                            props.hasChildren &&
                            hasChildrenFunc(cell, props.parentNodes, props.identifierField)
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
                  {row.cells.map((cell: Cell<D>, i: number) => {
                    return (
                      <td
                        key={`td-${i}`}
                        // Return an array of prop objects and react-table will merge them appropriately
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        )}{' '}
      </table>
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
