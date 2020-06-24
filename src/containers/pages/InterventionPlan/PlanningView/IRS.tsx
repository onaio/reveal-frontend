// this is the IRS LIST view page component
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { DRAFTS_PARENTHESIS, IRS_PLANS } from '../../../../configs/lang';
import {
  INTERVENTION_IRS_DRAFTS_URL,
  NEW,
  PLAN_RECORD_BY_ID,
  QUERY_PARAM_TITLE,
} from '../../../../constants';
import { loadOpenSRPPlans } from '../../../../helpers/dataLoading/plans';
import { getQueryParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import plansReducer, {
  fetchPlanRecords,
  InterventionType,
  makePlansArraySelector,
  PlanRecord,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import { OpenSRPPlansList, OpenSRPPlansListProps } from './OpenSRPPlansList';
import { irsDraftPageColumns } from './utils';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

interface IRSPlansProps {
  fetchPlanRecordsActionCreator: typeof fetchPlanRecords;
  service: typeof OpenSRPService;
  plansArray: PlanRecord[];
}

const defaultProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
  plansArray: [],
  service: OpenSRPService,
};

export const IRSPlans = (props: IRSPlansProps & RouteComponentProps) => {
  const { plansArray } = props;
  const draftPlansProps: Partial<OpenSRPPlansListProps> & RouteComponentProps = {
    ...props,
    loadData: (setLoading: React.Dispatch<React.SetStateAction<boolean>>) =>
      loadOpenSRPPlans(props.service, props.fetchPlanRecordsActionCreator, setLoading),
    newPlanUrl: `${INTERVENTION_IRS_DRAFTS_URL}/${NEW}`,
    pageTitle: `${IRS_PLANS}${DRAFTS_PARENTHESIS}`,
    pageUrl: INTERVENTION_IRS_DRAFTS_URL,
    plansArray,
    tableColumns: irsDraftPageColumns,
  };

  return <OpenSRPPlansList {...draftPlansProps} />;
};

/** describes props returned by mapStateToProps */
type DispatchedStateProps = Pick<IRSPlansProps, 'plansArray'>;
/** describe mapDispatchToProps object */
type MapDispatchToProps = Pick<IRSPlansProps, 'fetchPlanRecordsActionCreator'>;

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps
): DispatchedStateProps => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const planStatus = [PlanStatus.DRAFT];
  const plansRecordsArray = plansArraySelector(state as Registry, {
    interventionType: InterventionType.IRS,
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

const ConnectedIrsPlans = connect(mapStateToProps, mapDispatchToProps)(IRSPlans);

export default ConnectedIrsPlans;
