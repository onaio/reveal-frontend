import React from 'react';
import ReactTable, { Column, UseTableOptions } from 'react-table';
import { columnsFromObject } from '../helpers/utils';
import { Dictionary } from '@onaio/utils';

/** Simple function to use provided columns or get them from the data */
export function getColumns(props: Dictionary ): any {
  const { data, columns } = props;
  if (columns) {
    return columns;
  }
  if (data) {
    return columnsFromObject(data[0]);
  }

  return [];
}

/** A Higher order component that ensures table headers (column) are present
 * and are passed on to the WrappedTable component.
 * If columns already exist as a prop then nothing happens, otherwise columns
 * are derived from the data itself.
 */
// function WithHeaders(props: Dictionary) {
//   const newProps = {
//     columns: getColumns(props)
//   };
//   return <ReactTable {...newProps} {...props} />;
// }

// export default WithHeaders;
