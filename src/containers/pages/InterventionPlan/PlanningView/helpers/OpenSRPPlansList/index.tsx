import { DrillDownColumn } from '@onaio/drill-down-table';
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ActionCreator, Store } from 'redux';
import Loading from '../../../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../../../components/Table/NoDataComponent';
import {
  PLAN_RECORD_BY_ID,
  QUERY_PARAM_TITLE,
  QUERY_PARAM_USER,
} from '../../../../../../constants';
import {
  loadOpenSRPPlans,
  loadPlansByUserFilter,
} from '../../../../../../helpers/dataLoading/plans';
import { getQueryParams } from '../../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../../services/opensrp';

import { DISPLAYED_PLAN_TYPES } from '../../../../../../configs/env';
import {
  LOADING,
  NO_DATA_FOUND,
  USER_HAS_NO_PLAN_ASSIGNMENTS,
} from '../../../../../../configs/lang';
import { displayError } from '../../../../../../helpers/errors';
import plansByUserReducer, {
  fetchPlansByUser,
  makePlansByUserNamesSelector,
  reducerName as plansByUserReducerName,
} from '../../../../../../store/ducks/opensrp/planIdsByUser';
import plansReducer, {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  InterventionType,
  makePlansArraySelector,
  PlanRecord,
  reducerName as plansReducerName,
} from '../../../../../../store/ducks/plans';
import { BaseListComponent, BaseListComponentProps, BaseListTableProps } from '../BaseListing';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(plansByUserReducerName, plansByUserReducer);

/** minimal type for a renderProp */
export type RenderProp = () => React.ReactNode;

/** props for opensrpPlansList view */
export interface OpenSRPPlanListViewProps
  extends Omit<BaseListComponentProps, 'loadData' | 'getTableProps'> {
  fetchPlanRecordsCreator: ActionCreator<FetchPlanRecordsAction>;
  interventionTypes?: InterventionType[];
  planStatuses: string[];
  serviceClass: typeof OpenSRPService;
  sortByDate: boolean;
  tableColumns: Array<DrillDownColumn<PlanRecord>>;
  renderBody: (renderProp: RenderProp) => React.ReactNode;
  userName?: string | null;
  userNameFilter: boolean;
  noDataMessage: string;
}

/** default body render - allows to receive a JSX(as a render prop) from controlling component
 * that dictates how OpenSRPPlansList or its connected variation will sit
 * on the page that the controlling component is rendering.
 */
const defaultBodyRenderer = (componentRender: RenderProp) => {
  return <>{componentRender()}</>;
};

export const defaultProps: OpenSRPPlanListViewProps = {
  fetchPlanRecordsCreator: fetchPlanRecords,
  noDataMessage: NO_DATA_FOUND,
  planStatuses: [],
  plansArray: [],
  renderBody: defaultBodyRenderer,
  serviceClass: OpenSRPService,
  sortByDate: false,
  tableColumns: [],
  userNameFilter: false,
};

/** container view that renders opensrp plans from store , adds reveal-domain specific
 * stuff like the ui and functionality of the filters to be added to the table component
 */
const OpenSRPPlansList = (props: OpenSRPPlanListViewProps & RouteComponentProps) => {
  const {
    fetchPlanRecordsCreator,
    serviceClass,
    tableColumns,
    userNameFilter,
    noDataMessage,
  } = props;
  const loadData = (setLoading: React.Dispatch<React.SetStateAction<boolean>>) =>
    loadOpenSRPPlans(serviceClass, fetchPlanRecordsCreator, setLoading);
  const [loadingState, setLoadingState] = React.useState(!!props.userName);

  useEffect(() => {
    if (props.userName) {
      setLoadingState(true);
      loadPlansByUserFilter(
        props.userName,
        fetchPlansByUser,
        serviceClass,
        fetchPlanRecordsCreator,
        true
      )
        .finally(() => setLoadingState(false))
        .catch(err => displayError(err));
    }
  }, [props.userName]);

  const finalNoDataMessage = loadingState ? LOADING : noDataMessage;

  /** topbar filters */
  let topFilterBarParams: any = {
    ...defaultOptions,
    componentProps: props,
    queryParam: QUERY_PARAM_TITLE,
    showFilters: false,
  };

  if (userNameFilter) {
    topFilterBarParams = {
      ...topFilterBarParams,
      serviceClass: props.serviceClass,
      showFilters: true,
    };
  }

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
        ...topFilterBarParams,
      }),
      renderNullDataComponent: () => <NoDataComponent message={finalNoDataMessage} />,
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
export type MapStateToProps = Pick<OpenSRPPlanListViewProps, 'plansArray' | 'noDataMessage'>;
/** describe mapDispatchToProps object */
export type MapDispatchToProps = Pick<OpenSRPPlanListViewProps, 'fetchPlanRecordsCreator'>;
interface UserName {
  userName?: string | null;
}

/** data selector interface */
export interface DataSelectors {
  interventionType: InterventionType[];
  planIds?: string[] | null;
  statusList: string[];
  title: string;
}

const plansByUserNameSelector = makePlansByUserNamesSelector();

/** maps props  to state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps & OpenSRPPlanListViewProps
): MapStateToProps & UserName => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const { planStatuses, interventionTypes } = ownProps;
  const interventionType =
    interventionTypes && interventionTypes.length
      ? interventionTypes
      : (DISPLAYED_PLAN_TYPES as InterventionType[]);
  const dataSelectors: DataSelectors = {
    interventionType,
    statusList: planStatuses,
    title,
  };
  // useName selector
  const userName = getQueryParams(ownProps.location)[QUERY_PARAM_USER] as string;
  let noDataMessage = NO_DATA_FOUND;
  if (userName) {
    const planIds = plansByUserNameSelector(state, { userName });
    dataSelectors.planIds = planIds;
    if (planIds?.length === 0) {
      noDataMessage = USER_HAS_NO_PLAN_ASSIGNMENTS;
    }
  }

  const plansRecordsArray = plansArraySelector(state as Registry, dataSelectors) as PlanRecord[];
  // sort by date
  if (ownProps.sortByDate) {
    plansRecordsArray.sort(
      (a: PlanRecord, b: PlanRecord) => Date.parse(b.plan_date) - Date.parse(a.plan_date)
    );
  }
  const props = {
    noDataMessage,
    plansArray: plansRecordsArray,
    userName,
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
