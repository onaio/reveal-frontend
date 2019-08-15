import { RouteParams } from '@onaio/gatekeeper/dist/types';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import Loading from '../../../../../components/page/Loading';
import {
  AS,
  COMPLETE,
  CONFIRM,
  GO_BACK,
  MARK,
  MARK_AS_COMPLETE,
  OPENSRP_PLANS,
  PLAN_COMPLETION_URL,
} from '../../../../../constants';
import { FlexObject } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import { fetchPlans, getPlanById, Plan, PlanStatus } from '../../../../../store/ducks/plans';

/** Props interface for the plan completion component page */
export interface PlanCompletionProps {
  plan: Plan | null;
  fetchPlansActionCreator: typeof fetchPlans;
  serviceClass: typeof OpenSRPService;
}

/** default props for the plan completions component page */
export const defaultPlanCompletionProps: PlanCompletionProps = {
  fetchPlansActionCreator: fetchPlans,
  plan: null,
  serviceClass: OpenSRPService,
};

export class PlanCompletion extends React.Component<
  RouteComponentProps<RouteParams> & PlanCompletionProps,
  FlexObject
> {
  public static defaultProps = defaultPlanCompletionProps;
  constructor(props: RouteComponentProps<RouteParams> & PlanCompletionProps) {
    super(props);

    // This binding is necessary to make `this` work in the callback
    this.goBackClickHandler = this.goBackClickHandler.bind(this);
    this.confirmClickHandler = this.confirmClickHandler.bind(this);
  }

  /** click handler for cancelling mark as complete action */
  public goBackClickHandler = (event: any) => {
    this.props.history.goBack();
  };

  /** Click Handler : changes status of a plan to complete and syncs
   * that in between the redux store and the openSRP api
   */
  public async confirmClickHandler(event: any) {
    const { plan, serviceClass, fetchPlansActionCreator } = this.props;
    const planToconfirm: Plan = { ...(plan as Plan) };
    planToconfirm.plan_status = PlanStatus.COMPLETE;
    const service = new serviceClass(`${OPENSRP_PLANS}`);
    await service.update(planToconfirm).then(response => {
      fetchPlansActionCreator([planToconfirm]);
      this.props.history.push(`${PLAN_COMPLETION_URL}/${planToconfirm.id}`);
    });
  }

  public render() {
    const { plan } = this.props;

    if (!plan) {
      return <Loading />;
    }

    return (
      <div>
        <Helmet>
          <title>{`${MARK} ${plan.plan_title} ${AS} ${COMPLETE.toLocaleLowerCase()}`}</title>
        </Helmet>
        {/** prompt to confirm mark as complete click action */}
        <div className="card mb-3">
          <div className="card-header">{MARK_AS_COMPLETE}</div>
          <div className="card-body">
            {/* this should be error handlers not links */}
            {`${MARK} ${plan.plan_title} ${AS} ${COMPLETE.toLocaleLowerCase()}`}
            <button onClick={this.confirmClickHandler} className="btn btn-primary">
              {CONFIRM}
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button onClick={this.goBackClickHandler} className="btn btn-primary">
              {GO_BACK}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/** Map props to state
 * @param {Partial<Store>} -  the  redux store
 * @param {any} ownprops - components props
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any) => {
  const plan = getPlanById(state, ownProps.match.params.id);
  return {
    plan,
  };
};

/** Map props to action creators */
const mapDispatchToProps = {
  fetchPlansActionCreator: fetchPlans,
};

// connect presentational planCompletion to store
/** the connected Plan completion */
const ConnectedPlanCompletion = connect(
  mapStateToProps,
  mapDispatchToProps
)(PlanCompletion);

export default ConnectedPlanCompletion;
