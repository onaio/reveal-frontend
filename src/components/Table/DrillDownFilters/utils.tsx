/** utils that abstract code that customizes the drill-down-table */
import { RenderFiltersInBarOptions, renderPaginationFun } from '@onaio/drill-down-table';
import React from 'react';
import { ColumnHider } from '../../forms/ColumnHidder';
import { RowHeightFilter } from '../../forms/RowHeightPicker';

/** custom renderInFilter Function; renders the pagination, customize columns, and row height
 * in the filter bar
 * @param {RenderInFilterBar} tableProps - Table instance returned from useTable
 */
export const customTopRenderInFilterBar = <T extends object>(
  tableProps: RenderFiltersInBarOptions<T>
) => {
  const changeHandler = (value: string) => tableProps.setRowHeight(value);
  return (
    <div className="row">
      <div className="col">
        <RowHeightFilter changeHandler={changeHandler} />
        <ColumnHider {...tableProps} />
        {renderPaginationFun(tableProps)}
      </div>
    </div>
  );
};
