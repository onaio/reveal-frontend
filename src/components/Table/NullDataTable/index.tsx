import DrillDownTable from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import * as React from 'react';
import { Column } from 'react-table';
import { NO_INVESTIGATIONS_FOUND } from '../../../configs/lang';

/** Interface to describe props for TableProps */
export interface TableProps {
  data: Dictionary[];
  columns: Column[];
  state?: any;
  debug?: boolean;
}
/** Interface to describe props for NullDataTable components  */
export interface NullDataTableProps {
  tableProps: TableProps;
  reasonType: string;
}
/** Component returns table with <th> with no data */
class NullDataTable extends React.Component<NullDataTableProps, {}> {
  constructor(props: NullDataTableProps) {
    super(props);
  }
  public render() {
    const { reasonType, tableProps } = this.props;
    return (
      <div>
        <h3 className="mb-3 mt-5 page-title">{reasonType}</h3>
        <DrillDownTable {...tableProps} NoDataComponent={(() => null) as any} />
        <h3 className="text-muted">{NO_INVESTIGATIONS_FOUND}</h3>
        <hr />
      </div>
    );
  }
}
export default NullDataTable;
