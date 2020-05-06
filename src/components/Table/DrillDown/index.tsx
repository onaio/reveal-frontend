import { Dictionary } from '@onaio/utils';
import React, { useState } from 'react';
import { Cell, ColumnInstance } from 'react-table';
import Ripple from '../../page/Loading';
import { ID, PARENT_ID, ROOT_PARENT_ID } from './helpers/constants';
import DropDownCell, { DropDownCellProps } from './helpers/DefaultDropDownCell/DropDownCell';
import { hasChildrenFunc, Table, TableJSXProps } from './TableJSX';

/** describes props for the DrillDownTable component */
interface DrillDownTableProps<D extends object>
  extends Omit<TableJSXProps<D>, 'pgCount' | 'fetchData'> {
  linkerField?: string /** the field to be used to drill down the data */;
  extraCellProps?: Dictionary /** props to be given to CellComponent */;
  CellComponent: React.ElementType;
  useDrillDown: boolean;
  loading: boolean;
  LoadingComponent: React.ElementType;
}

/** only provide defaults for the props that are actionable as part of this HOC */
const defautlDrillDownTableProps = {
  CellComponent: DropDownCell,
  LoadingComponent: Ripple,
  hasChildren: hasChildrenFunc,
  identifierField: ID,
  linkerField: ID,
  parentIdentifierField: PARENT_ID,
  rootParentId: ROOT_PARENT_ID,
  useDrillDown: false,
};

function DrillDownTable<D extends object>(props: DrillDownTableProps<D>) {
  const { columns, data, parentIdentifierField, hasChildren, LoadingComponent } = props;
  const parentNodes =
    data && parentIdentifierField ? data.map((el: Dictionary) => el[parentIdentifierField]) : [];
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
      let filterByLevel = props.data;
      if (props.useDrillDown) {
        filterByLevel = props.data.filter((row: any) => {
          return row[parentIdentifierField] === parentId;
        });
      }

      // const filterByPage = filterByLevel.slice(startRow, endRow);

      setpageData(filterByLevel);
      setPageCount(Math.ceil(filterByLevel.length / pageSize));
    },
    [data]
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
    <>
      {!props.loading ? (
        <Table
          columns={mutatedColumns}
          data={pageData}
          pgCount={pgCount}
          fetchData={fetchData}
          parentNodes={parentNodes}
          renderInFilterBar={props.renderInFilterBar}
          rootParentId={props.rootParentId}
        />
      ) : (
        <LoadingComponent />
      )}
    </>
  );
}

DrillDownTable.defaultProps = defautlDrillDownTableProps;

export { DrillDownTable };
