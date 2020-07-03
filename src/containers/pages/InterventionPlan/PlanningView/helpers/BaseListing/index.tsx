/**  underlying controlled component that fetches the plan data from
 * opensrp api and renders it.
 */
import { DrillDownTable, DrillDownTableProps } from '@onaio/drill-down-table';
import React from 'react';
import { NoDataComponent } from '../../../../../../components/Table/NoDataComponent';
import { PlanRecord } from '../../../../../../store/ducks/plans';
import { draftPageColumns } from '../utils';

/** table prop type */
export type BaseListTableProps = Pick<
  DrillDownTableProps<PlanRecord>,
  | 'columns'
  | 'data'
  | 'loading'
  | 'loadingComponent'
  | 'renderInBottomFilterBar'
  | 'renderInTopFilterBar'
  | 'useDrillDown'
  | 'renderNullDataComponent'
>;

/** gets props to be passed to drillDown Table */
export const getDefaultTableProps = (loading: boolean, data: PlanRecord[]) => {
  return {
    columns: draftPageColumns,
    data,
    loading,
    renderNullDataComponent: () => <NoDataComponent />,
    useDrillDown: false,
  };
};

/** props for base list component
 * responsibilities for this is to fetch data and render it in the table
 * it should receive a data loading function that tells it how to send the
 * data to the store after being received.
 */
export interface BaseListComponentProps<TProps = BaseListTableProps> {
  loadData?: (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => void;
  plansArray: PlanRecord[];
  getTableProps?: (loading: boolean, data: PlanRecord[]) => TProps;
}

const defaultBaseListProps = {
  plansArray: [],
};

/** pull data from the api and render table */
function BaseListComponent(props: BaseListComponentProps) {
  const [loading, setLoading] = React.useState<boolean>(props.plansArray.length === 0);

  const { loadData, getTableProps } = props;
  React.useEffect(() => {
    if (!loadData) {
      setLoading(false);
    } else {
      loadData(setLoading);
    }
  }, []);

  const tablePropsGetter = getTableProps ? getTableProps : getDefaultTableProps;

  const tableProps = tablePropsGetter(loading, props.plansArray);

  return <DrillDownTable {...tableProps} />;
}

BaseListComponent.defaultProps = defaultBaseListProps;

export { BaseListComponent };
