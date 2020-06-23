// this is the IRS LIST view page component
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { PLAN_RECORD_BY_ID, QUERY_PARAM_TITLE } from '../../../../constants';
import { loadOpenSRPPlans } from '../../../../helpers/dataLoading/plans';
import { getQueryParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import plansReducer, {
  fetchPlanRecords,
  makePlansArraySelector,
  PlanRecord,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import { OpenSRPPlansList } from './DumbTableView';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

interface IRSPlans {
  fetchPlanRecordsActionCreator: typeof fetchPlanRecords;
  service: typeof OpenSRPService;
  plansArray: PlanRecord[];
}

const defaultProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
  plansArray: [],
  service: OpenSRPService,
};

export const IRSPlans = (props: any) => {
  const { plansArray } = props;
  const draftPlansProps = {
    ...props,
    loadData: (setLoading: React.Dispatch<React.SetStateAction<boolean>>) =>
      loadOpenSRPPlans(props.service, props.fetchPlanRecordsActionCreator, setLoading),
    plansArray,
  };

  return <OpenSRPPlansList {...draftPlansProps} />;
};

/** IrsPlansProps - interface for IRS Plans page */

/** describes props returned by mapStateToProps */
type DispatchedStateProps = Pick<IRSPlans, 'plansArray'>;
/** describe mapDispatchToProps object */
type MapDispatchToProps = Pick<IRSPlans, 'fetchPlanRecordsActionCreator'>;

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

const mapDispatchToProps: MapDispatchToProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
};

IRSPlans.defaultProps = defaultProps;

const ConnectedDraftPlans = connect(mapStateToProps, mapDispatchToProps)(IRSPlans);

export default ConnectedDraftPlans;
