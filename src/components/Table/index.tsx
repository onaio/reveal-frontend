import { Dictionary } from '@onaio/utils';
import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Cell,
  Column,
  ColumnInstance,
  Row,
  TableInstance,
  usePagination,
  UsePaginationInstanceProps,
  useSortBy,
  UseSortByColumnProps,
  useTable,
  UseTableHeaderGroupProps,
  UseTableInstanceProps,
} from 'react-table';
import { ID, PARENT_ID, ROOT_PARENT_ID } from './helpers/constants';
import DropDownCell, { DropDownCellProps } from './helpers/DropDownCell';
import { renderPaginationFun } from './helpers/pagination/pagination';
import { SortIcon } from './helpers/SortIcon/sortHelpers';
import './table.css';

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
  return parentIdList.includes((cellObject.row.original as Dictionary)[idField]);
}

/** describes props for the underlying Table component */
interface TableProps<TData extends object> {
  columns: Array<ColumnInstance<TData>>;
  data: TData[];
  pgCount: number;
  fetchData: (options: Dictionary) => void;
  setCurrentParentId: Dispatch<SetStateAction<string>>;
  currentParentId: string;
  identifierField: string;
  parentNodes: Array<string | number>;
  parentIdentifierField: string;
  hasChildren: HasChildrenFuncType;
  showBottomPagination: boolean;
  renderPagination: (props: Dictionary) => React.ElementType;
}

const defaultTableProps = {
  hasChildren: hasChildrenFunc,
  identifierField: ID,
  parentIdentifierField: PARENT_ID,
  renderPagination: renderPaginationFun,
  showBottomPagination: true,
};

/** the underlying Table component
 * its seprarate since we want to control some of its aspects, specifically pagination
 */
function Table<D extends object>(props: TableProps<D>) {
  const {
    columns,
    data,
    pgCount,
    fetchData,
    setCurrentParentId,
    currentParentId,
    identifierField,
  } = props;
  const skipPageResetRef = React.useRef<boolean>();

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
      // prevent the table from auto resetting when we change our data source
      autoResetPage: skipPageResetRef.current,
      columns,
      data,
      initialState: { pageIndex: 0 },
      manualPagination: true,
      pageCount: pgCount,
    } as any,
    useSortBy,
    usePagination
  );

  React.useEffect(() => {
    fetchData({ pageSize, pageIndex, skipPageResetRef, currentParentId });
    skipPageResetRef.current = false;
  }, [fetchData, pageSize, pageIndex, currentParentId]);

  return (
    <div className="table-container">
      <table className="drill-down-table" {...getTableProps()}>
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
        <tbody {...getTableBodyProps()}>
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
                          const newParentId: string = (row.original as Dictionary)[identifierField];
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
      </table>
      {props.showBottomPagination &&
        props.renderPagination({
          canNextPage,
          canPreviousPage,
          gotoPage,
          nextPage,
          pageCount,
          pageIndex,
          pageOptions,
          pageSize,
          previousPage,
          setPageSize,
        })}
    </div>
  );
}

Table.defaultProps = defaultTableProps;
export { Table };

/** describes props for the DrillDownTable component */
interface DrillDownTableProps<D extends object> {
  rootParentId: string;
  columns: Array<ColumnInstance<D>>;
  data: D[];
  parentIdentifierField: string;
  hasChildren: HasChildrenFuncType;
  linkerField?: string /** the field to be used to drill down the data */;
  extraCellProps?: Dictionary /** props to be given to CellComponent */;
  CellComponent: React.ElementType;
  identifierField?: string /** unique identifier for a row */;
}

const defautlDrillDownTableProps = {
  CellComponent: DropDownCell,
  hasChildren: hasChildrenFunc,
  identifierField: ID,
  linkerField: ID,
  parentIdentifierField: PARENT_ID,
  rootParentId: ROOT_PARENT_ID,
};

function DrillDownTable<D extends object>(props: DrillDownTableProps<D>) {
  const { columns, data, parentIdentifierField, hasChildren } = props;
  const parentNodes =
    data && parentIdentifierField ? data.map((el: Dictionary) => el[parentIdentifierField]) : [];
  const [currentParentId, setCurrentParentId] = useState<string>(props.rootParentId);
  const [pageData, setpageData] = useState<D[]>([]);
  const [pgCount, setPageCount] = useState<number>(0);
  const mutatedColumns = React.useMemo(() => columns.map(mutateColumns), []) as Array<
    ColumnInstance<D>
  >;

  const fetchData = React.useCallback(
    ({ pageSize, pageIndex, skipPageResetRef, currentParentId: parentId }) => {
      skipPageResetRef.current = true;
      const startRow = pageSize * pageIndex;
      // TODO - enforce typings for the above parameters
      // tslint:disable-next-line: restrict-plus-operands
      const endRow = startRow + pageSize;
      const filterByLevel = props.data.filter((row: any) => {
        return row[parentIdentifierField] === parentId;
      });

      const filterByPage = filterByLevel.slice(startRow, endRow);

      setpageData(filterByPage);
      setPageCount(Math.ceil(filterByLevel.length / pageSize));
    },
    []
  );

  /** Get modified columns
   * Modify the linker column to include an indicator that you can use to
   * drill-down
   */
  function mutateColumns(el: Dictionary) {
    const { linkerField, CellComponent, extraCellProps } = props;
    if (el.hasOwnProperty('columns') && el.columns && el.columns.length > 0) {
      const newColumns = el.columns.map(mutateColumns);
      el.columns = newColumns;
    }

    if (el.accessor === linkerField) {
      el.Cell = (cell: Cell) => {
        if (CellComponent !== undefined) {
          const { identifierField } = props;

          let thisCellHasChildren = false;
          if (hasChildren && identifierField && hasChildren(cell, parentNodes, identifierField)) {
            thisCellHasChildren = true;
          }

          const cellProps: DropDownCellProps = {
            cell,
            cellValue: cell.value,
            hasChildren: thisCellHasChildren,
          };

          if (extraCellProps !== undefined) {
            Object.assign(cellProps, extraCellProps);
          }
          return <CellComponent {...cellProps} />;
        }
        return cell.value;
      };
    }
    return el;
  }

  return (
    <Table
      columns={mutatedColumns}
      data={pageData}
      pgCount={pgCount}
      fetchData={fetchData}
      currentParentId={currentParentId}
      setCurrentParentId={setCurrentParentId}
      parentNodes={parentNodes}
    />
  );
}

DrillDownTable.defaultProps = defautlDrillDownTableProps;

export { DrillDownTable };
