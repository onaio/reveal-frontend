/** presentational component that renders a list of plan definitions( plans fetched from the opensrp api ) */
import { DrillDownColumn } from '@onaio/drill-down-table';
import { Registry } from '@onaio/redux-reducer-registry/dist/types';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ActionCreator, Store } from 'redux';
import Loading from '../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import { PLAN_RECORD_BY_ID, QUERY_PARAM_TITLE } from '../../../../constants';
import { loadOpenSRPPlans } from '../../../../helpers/dataLoading/plans';
import { getQueryParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  makePlansArraySelector,
  PlanRecord,
  PlanStatus,
} from '../../../../store/ducks/plans';
import {
  BaseListComponent,
  BaseListComponentProps,
  BaseListTableProps,
} from './helpers/BaseListing';
import { draftPageColumns } from './utils';

export type RenderProp = () => React.ReactNode;

/** props for opensrpPlansList view */
export interface OpenSRPPlanListViewProps
  extends Omit<BaseListComponentProps, 'loadData' | 'getTableProps'> {
  fetchPlanRecordsCreator: ActionCreator<FetchPlanRecordsAction>;
  serviceClass: typeof OpenSRPService;
  tableColumns: Array<DrillDownColumn<PlanRecord>>;
  renderBody: (renderProp: RenderProp) => React.ReactNode;
}

/** default body render */
const defaultBodyRenderer = (componentRender: RenderProp) => {
  return <>{componentRender()}</>;
};

export const defaultProps: OpenSRPPlanListViewProps = {
  fetchPlanRecordsCreator: fetchPlanRecords,
  plansArray: [],
  renderBody: defaultBodyRenderer,
  serviceClass: OpenSRPService,
  tableColumns: draftPageColumns,
};

/** container view that renders opensrp plans from store , adds reveal-domain specific
 * stuff like the ui and functionality of the filters to be added to the table component
 */
const OpenSRPPlansList = (props: OpenSRPPlanListViewProps & RouteComponentProps) => {
  const { plansArray, fetchPlanRecordsCreator, serviceClass, tableColumns } = props;
  const loadData = (setLoading: React.Dispatch<React.SetStateAction<boolean>>) =>
    loadOpenSRPPlans(serviceClass, fetchPlanRecordsCreator, setLoading);

  const getTableProps = (loading: boolean): BaseListTableProps => {
    return {
      columns: tableColumns,
      data: plansArray,
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
type DispatchedStateProps = Pick<BaseListComponentProps, 'plansArray'>;
/** describe mapDispatchToProps object */
type MapDispatchToProps = Pick<OpenSRPPlanListViewProps, 'fetchPlanRecordsCreator'>;

/** maps props  to state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps
): DispatchedStateProps => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const planStatus = [PlanStatus.DRAFT];
  const plansRecordsArray = plansArraySelector(state as Registry, {
    statusList: planStatus,
    title,
  });
  const props = {
    plansArray: plansRecordsArray,
  };
  return props;
};

/** map action creators  */
const mapDispatchToProps: MapDispatchToProps = {
  fetchPlanRecordsCreator: fetchPlanRecords,
};

/** container creator that allows for configurable containers */
// TODO - will need to explicit set types for the args here, for true flexibility
export const createConnectedOpenSRPPlansList = (
  mapState = mapStateToProps,
  mapDispatch = mapDispatchToProps
) => {
  return connect(mapState, mapDispatch)(OpenSRPPlansList);
};
