import { Column } from 'react-table';
import { ColumnHider } from '../../../forms/ColumnHidder';
import { RowHeightFilter } from '../../../forms/RowHeightPicker';
import { renderPaginationFun } from '../components/Pagination/pagination';
import { RenderFiltersInBarOptions } from '../components/TableJSX';
import { PAGE_SIZE_CATEGORIES } from './constants';

/** Takes an object and returns columns that are compatible with react-table
 * derived from the object's keys
 */
export function columnsFromObject<D extends object>(items: D[]): Array<Column<D>> {
  if (items.length < 1) {
    return [];
  }
  return (Object.keys(items[0]).map(k => ({ Header: k, accessor: k })) as unknown) as Array<
    Column<D>
  >;
}

/** default renderInFilter Function; includes the pagination, customize columns, and row height */
export const customRenderInFilterBar = <T extends object>(
  tableProps: RenderFiltersInBarOptions<T>
) => {
  const changeHandler = (value: string) => tableProps.setRowHeight(value);
  return (
    <div className="row">
      <div className="col">
        <RowHeightFilter changeHandler={changeHandler} />
        <ColumnHider {...tableProps} />
        {renderPaginationFun({ ...tableProps, pageSizeCategories: PAGE_SIZE_CATEGORIES })}
      </div>
    </div>
  );
};
