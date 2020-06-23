import { DrillDownColumn, DrillDownTable } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import * as React from 'react';
import uuid from 'uuid/v1';

/** Interface to describe props for TableProps */
export interface TableProps<T extends object> {
  data: T[];
  columns: Array<DrillDownColumn<T>>;
}
/** Interface to describe props for NullDataTable components  */
export interface NullDataTableProps<D extends object> {
  tableProps: TableProps<D>;
  reasonType: string;
}

/** makes sure there is an accessor or unique Id field for each of column objects
 * passed to table.
 * There are a lot of columns already defined that have no accessor or id field,
 * instead of adding the ids to each of this columns I decided to mutate them from
 * here
 * @param {DrillDownColumn[]} - original columns
 */
const sanitizeColumns = <D extends object>(columns: Array<DrillDownColumn<D>>) => {
  const localColumns: Dictionary[] = columns;
  localColumns.forEach(column => {
    column.accessor = column.Header || `${uuid()}`;
    if (column.columns) {
      sanitizeColumns(column.columns);
    }
  });
};

/** Component returns table with <th> with no data */
export function NullDataTable<D extends object>(props: NullDataTableProps<D>) {
  const { reasonType, tableProps } = props;
  sanitizeColumns(tableProps.columns);

  return (
    <div>
      <h3 className="mb-3 mt-5 page-title">{reasonType}</h3>
      <DrillDownTable {...tableProps} />
      <hr />
    </div>
  );
}

export default NullDataTable;
