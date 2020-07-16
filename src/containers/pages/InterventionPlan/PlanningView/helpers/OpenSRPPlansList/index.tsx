import { DrillDownColumn } from '@onaio/drill-down-table';
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ActionCreator, Store } from 'redux';
import Loading from '../../../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../../../components/Table/NoDataComponent';
import { PLAN_RECORD_BY_ID, QUERY_PARAM_TITLE } from '../../../../../../constants';
import { loadOpenSRPPlans } from '../../../../../../helpers/dataLoading/plans';
import { getQueryParams } from '../../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../../services/opensrp';

import plansReducer, {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  makePlansArraySelector,
  PlanRecord,
  reducerName as plansReducerName,
} from '../../../../../../store/ducks/plans';
import { BaseListComponent, BaseListComponentProps, BaseListTableProps } from '../BaseListing';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** minimal type for a renderProp */
export type RenderProp = () => React.ReactNode;

/** props for opensrpPlansList view */
export interface OpenSRPPlanListViewProps
  extends Omit<BaseListComponentProps, 'loadData' | 'getTableProps'> {
  activePlans: string[];
  fetchPlanRecordsCreator: ActionCreator<FetchPlanRecordsAction>;
  serviceClass: typeof OpenSRPService;
  sortByDate: boolean;
  tableColumns: Array<DrillDownColumn<PlanRecord>>;
  renderBody: (renderProp: RenderProp) => React.ReactNode;
}

/** default body render - allows to receive a JSX(as a render prop) from controlling component
 * that dictates how OpenSRPPlansList or its connected variation will sit
 * on the page that the controlling component is rendering.
 */
const defaultBodyRenderer = (componentRender: RenderProp) => {
  return <>{componentRender()}</>;
};

export const defaultProps: OpenSRPPlanListViewProps = {
  activePlans: [],
  fetchPlanRecordsCreator: fetchPlanRecords,
  plansArray: [],
  renderBody: defaultBodyRenderer,
  serviceClass: OpenSRPService,
  sortByDate: false,
  tableColumns: [],
};

/** container view that renders opensrp plans from store , adds reveal-domain specific
 * stuff like the ui and functionality of the filters to be added to the table component
 */
const OpenSRPPlansList = (props: OpenSRPPlanListViewProps & RouteComponentProps) => {
  const { fetchPlanRecordsCreator, serviceClass, tableColumns } = props;
  const loadData = (setLoading: React.Dispatch<React.SetStateAction<boolean>>) =>
    loadOpenSRPPlans(serviceClass, fetchPlanRecordsCreator, setLoading);

  const getTableProps = (loading: boolean, data: PlanRecord[]): BaseListTableProps => {
    return {
      columns: tableColumns,
      data,
      loading,
      loadingComponent: Loading,
      renderInBottomFilterBar: renderInFilterFactory({
        showColumnHider: false,
        showFilters: false,
        showPagination: true,
        showRowHeightPicker: false,
        showSearch: false,
      }),
      renderInTopFilterBar: renderInFilterFactory({
        ...defaultOptions,
        componentProps: props,
        queryParam: QUERY_PARAM_TITLE,
        showFilters: false,
      }),
      renderNullDataComponent: () => <NoDataComponent />,
      useDrillDown: false,
    };
  };

  const connectedBaseViewProps = {
    ...props,
    getTableProps,
    loadData,
  };

  const renderConnectedOpenSRPList = () => {
    return <BaseListComponent {...connectedBaseViewProps} />;
  };

  return <>{props.renderBody(renderConnectedOpenSRPList)}</>;
};

OpenSRPPlansList.defaultProps = defaultProps;

export { OpenSRPPlansList };

/** describes props returned by mapStateToProps */
export type MapStateToProps = Pick<BaseListComponentProps, 'plansArray'>;
/** describe mapDispatchToProps object */
export type MapDispatchToProps = Pick<OpenSRPPlanListViewProps, 'fetchPlanRecordsCreator'>;

/** maps props  to state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps & OpenSRPPlanListViewProps
): MapStateToProps => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID, 'plan_date');
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const planStatus = ownProps.activePlans;
  let plansRecordsArray = plansArraySelector(state as Registry, {
    statusList: planStatus,
    title,
  });
  if (ownProps.sortByDate) {
    plansRecordsArray = plansRecordsArray.sort(
      (a: PlanRecord, b: PlanRecord) => Date.parse(b.plan_date) - Date.parse(a.plan_date)
    );
  }
  const props = {
    plansArray: plansRecordsArray,
  };
  return props;
};

/** map action creators  */
const mapDispatchToProps: MapDispatchToProps = {
  fetchPlanRecordsCreator: fetchPlanRecords,
};

/** container creator that allows for configurable containers
 * the arguments passed here should respect the props that OpenSRPPlans list component take
 */
export const createConnectedOpenSRPPlansList = (
  mapState = mapStateToProps,
  mapDispatch = mapDispatchToProps
) => {
  return connect(mapState, mapDispatch)(OpenSRPPlansList);
};
