/** utils that abstract code that customizes the drill-down-table */
import { RenderFiltersInBarOptions, renderPaginationFun } from '@onaio/drill-down-table-v7';
import React from 'react';
import { ColumnHider } from '../../forms/ColumnHider';
import { RowHeightFilter } from '../../forms/RowHeightPicker';
import { SearchForm, SearchFormProps } from '../../forms/Search';

/** options for renderInFilterFactory function */
export interface Options extends Partial<SearchFormProps> {
  showRowHeightPicker: boolean;
  showColumnHider: boolean;
  showPagination: boolean;
  showSearch: boolean;
}

export const defaultOptions = {
  showColumnHider: true,
  showPagination: true,
  showRowHeightPicker: true,
  showSearch: true,
};

/** creates the component structure to be rendered in either of drillDowns top or bottom
 * filter
 */
export const renderInFilterFactory = ({
  showRowHeightPicker = true,
  showColumnHider = true,
  showPagination = true,
  showSearch = true,
  ...rest
}: Options) => {
  /** custom renderInFilter Function; renders the pagination, customize columns, and row height
   * in the filter bar
   * @param {RenderInFilterBar} tableProps - Table instance returned from useTable
   */
  return <T extends object>(tableProps: RenderFiltersInBarOptions<T>) => {
    const changeHandler = (value: string) => tableProps.setRowHeight(value);
    return (
      <div className="row">
        <div className="col">
          {showSearch && rest.history && rest.location && (
            <SearchForm
              history={rest.history}
              location={rest.location}
              placeholder={rest.placeholder}
            />
          )}
          {showRowHeightPicker && <RowHeightFilter changeHandler={changeHandler} />}
          {showColumnHider && <ColumnHider {...tableProps} />}
          {showPagination && renderPaginationFun(tableProps)}
        </div>
      </div>
    );
  };
};
