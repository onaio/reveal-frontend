import { RouteParams } from '@onaio/gatekeeper/dist/types';
import { Dictionary } from '@onaio/utils';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { toast } from 'react-toastify';
import { Store } from 'redux';
import { format } from 'util';
import Loading from '../../../../../components/page/Loading';
import {
  CANCEL,
  CONFIRM,
  MARK_AS_COMPLETE,
  MARK_PLAN_AS_COMPLETE,
  NO_PLAN_FOUND_ERROR,
  PLAN_STATUS_UPDATE_ERROR,
} from '../../../../../configs/lang';
import { FI_SINGLE_MAP_URL, OPENSRP_PLANS, PLAN_LIST_URL } from '../../../../../constants';
import { growl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import {
  fetchPlans,
  getPlanById,
  Plan,
  PlanPayload,
  PlanStatus,
} from '../../../../../store/ducks/plans';
import './index.css';

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
  Dictionary
> {
  public static defaultProps = defaultPlanCompletionProps;
  constructor(props: RouteComponentProps<RouteParams> & PlanCompletionProps) {
    super(props);

    // This binding is necessary to make `this` work in the callback
    this.cancelClickHandler = this.cancelClickHandler.bind(this);
    this.confirmClickHandler = this.confirmClickHandler.bind(this);
  }

  /** click handler for cancelling mark as complete action */
  public cancelClickHandler = () => {
    this.props.history.replace(`${FI_SINGLE_MAP_URL}/${this.props.plan!.id}`);
  };

  /** Click Handler : changes status of a plan to complete and syncs
   * that in between the redux store and the openSRP api
   */
  public async confirmClickHandler() {
    const { plan, serviceClass, fetchPlansActionCreator } = this.props;
    const planToconfirm: Plan = { ...(plan as Plan), plan_status: PlanStatus.COMPLETE };
    const service = new serviceClass(OPENSRP_PLANS);

    // get the plan as it exists in the OpenSRP Server
    await service
      .read(planToconfirm.plan_id)
      .then((fullPayload: PlanPayload[]) => {
        const planPayload = fullPayload[0];
        if (planPayload && JSON.stringify(planPayload) !== '{}') {
          // set the plan status to complete
          const thePlan: PlanPayload = {
            ...planPayload,
            status: PlanStatus.COMPLETE,
          };
          // update the plan with updated status
          return service
            .update(thePlan)
            .then(() => {
              // todo - extract Plan from PlanPayload to save to state
              fetchPlansActionCreator([planToconfirm]);
              // redirect to Focus Investigations page
              this.props.history.push(`${PLAN_LIST_URL}`);
            })
            .catch(e =>
              growl(`${PLAN_STATUS_UPDATE_ERROR}: ${e.message}`, { type: toast.TYPE.ERROR })
            );
        } else {
          // catch the error of the plan not existing in the server
          growl(NO_PLAN_FOUND_ERROR, { type: toast.TYPE.ERROR });
        }
      })
      .catch(e => growl(`${PLAN_STATUS_UPDATE_ERROR}: ${e.message}`, { type: toast.TYPE.ERROR }));
  }

  public render() {
    const { plan } = this.props;
    if (!plan) {
      return <Loading />;
    }

    return (
      <div id="plan-completion-page-wrapper">
        <Helmet>
          <title>{format(MARK_PLAN_AS_COMPLETE, plan.plan_title)}</title>
        </Helmet>
        {/** prompt to confirm mark as complete click action */}
        <h2 className="mb-3 mt-5 page-title">{format(MARK_PLAN_AS_COMPLETE, plan.plan_title)}</h2>
        <hr />
        <div className="card mb-3">
          <div className="card-header">{MARK_AS_COMPLETE}</div>
          <div className="card-body">
            {/* this should be error handlers not links */}
            <p>{format(MARK_PLAN_AS_COMPLETE, plan.plan_title)}</p>
            <button
              id="complete-plan-cancel-btn"
              onClick={this.cancelClickHandler}
              className="btn btn-danger"
            >
              {CANCEL}
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button
              id="complete-plan-confirm-btn"
              onClick={this.confirmClickHandler}
              className="btn btn-success"
            >
              {CONFIRM}
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
const ConnectedPlanCompletion = connect(mapStateToProps, mapDispatchToProps)(PlanCompletion);

export default ConnectedPlanCompletion;
