/** utils that abstract code that customizes the drill-down-table */
import {
  DrillDownInstanceProps,
  RenderFiltersInBarOptions,
  RevealPagination,
} from '@onaio/drill-down-table';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { NEXT, OF, PAGE, PREVIOUS, ROWS_TO_DISPLAY } from '../../../configs/lang';
import { OpenSRPService } from '../../../services/opensrp';
import { ColumnHider } from '../../forms/ColumnHider';
import { RowHeightFilter } from '../../forms/RowHeightPicker';
import { createChangeHandler, SearchForm, SearchFormProps } from '../../forms/Search';
import { UserSelectFilter } from '../../forms/UserFilter';

/** custom renderProp that renders a custom pagination component
 * @param {DrillDownInstanceProps<t>} props - the React table instance containing applied hooks.
 */
export const renderPaginationFun = <T extends object>(props: DrillDownInstanceProps<T>) => {
  const allProps = {
    ...props,
    nextText: NEXT,
    ofText: OF,
    pageText: PAGE,
    previousText: PREVIOUS,
    rowsToDisplayText: ROWS_TO_DISPLAY,
  };
  return <RevealPagination {...allProps} />;
};

/** options for renderInFilterFactory function */
export interface Options extends Partial<SearchFormProps> {
  showRowHeightPicker: boolean;
  showColumnHider: boolean;
  showPagination: boolean;
  showSearch: boolean;
  showFilters: boolean;
  queryParam?: string;
  serviceClass?: typeof OpenSRPService;
  componentProps?: RouteComponentProps;
}

export const defaultOptions = {
  showColumnHider: true,
  showFilters: true,
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
  showFilters = true,
  ...rest
}: Options) => {
  /** custom renderInFilter Function; renders the pagination, customize columns, and row height
   * in the filter bar
   * @param {RenderInFilterBar} tableProps - Table instance returned from useTable
   */
  return <T extends object>(tableProps: RenderFiltersInBarOptions<T>) => {
    const changeHandler = (value: string) => tableProps.setRowHeight(value);
    let searchFormChangeHandler: ReturnType<typeof createChangeHandler> = () => {
      return;
    };
    if (rest.componentProps && rest.queryParam) {
      searchFormChangeHandler = createChangeHandler(rest.queryParam, rest.componentProps);
    }
    return (
      <div className="row">
        <div className="col">
          {showSearch && rest.componentProps && rest.queryParam && (
            <SearchForm onChangeHandler={searchFormChangeHandler} />
          )}
          {showFilters && rest.serviceClass && (
            <UserSelectFilter serviceClass={rest.serviceClass} />
          )}
          {showRowHeightPicker && <RowHeightFilter changeHandler={changeHandler} />}
          {showColumnHider && <ColumnHider {...tableProps} />}
          {showPagination && renderPaginationFun(tableProps)}
        </div>
      </div>
    );
  };
};
