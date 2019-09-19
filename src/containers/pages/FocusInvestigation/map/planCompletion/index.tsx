import { RouteParams } from '@onaio/gatekeeper/dist/types';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import Loading from '../../../../../components/page/Loading';
import {
  AS,
  CANCEL,
  COMPLETE,
  CONFIRM,
  FI_SINGLE_MAP_URL,
  MARK,
  MARK_AS_COMPLETE,
  OPENSRP_PLANS,
  PLAN_LIST_URL,
} from '../../../../../constants';
import { FlexObject } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import {
  fetchPlans,
  getPlanById,
  getPlanRecordById,
  Plan,
  PlanPayload,
  PlanRecord,
  PlanStatus,
} from '../../../../../store/ducks/plans';

/** Props interface for the plan completion component page */
export interface PlanCompletionProps {
  plan: Plan | PlanRecord | null;
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
    this.cancelClickHandler = this.cancelClickHandler.bind(this);
    this.confirmClickHandler = this.confirmClickHandler.bind(this);
  }

  /** click handler for cancelling mark as complete action */
  public cancelClickHandler = (event: any) => {
    this.props.history.goBack();
  };

  /** Click Handler : changes status of a plan to complete and syncs
   * that in between the redux store and the openSRP api
   */
  public async confirmClickHandler(event: any) {
    const { plan, serviceClass, fetchPlansActionCreator } = this.props;
    const planToconfirm: Plan = { ...(plan as Plan), plan_status: PlanStatus.COMPLETE };
    const service = new serviceClass(`${OPENSRP_PLANS}`);

    // get the plan as it exists in the OpenSRP Server
    await service.read(planToconfirm.plan_id).then((planPayload: PlanPayload) => {
      if (
        planPayload &&
        JSON.stringify(planPayload) !== '{}' &&
        JSON.stringify(planPayload) !== '[]'
      ) {
        // set the plan status to complete
        const thePlan: PlanPayload = {
          ...(Array.isArray(planPayload) ? planPayload[0] : planPayload),
          status: PlanStatus.COMPLETE,
        };
        // update the plan with updated status
        return service
          .update(thePlan)
          .then(response => {
            // todo - extract Plan from PlanPayload to save to state
            fetchPlansActionCreator([planToconfirm]);
            // redirect to Focus Investigations page
            this.props.history.push(`${PLAN_LIST_URL}`);
          })
          .catch(e => {
            // catch the error if one is returned from OpenSRP
            alert('Sorry, something went wrong when we tried to update the plan status');
          });
      } else {
        // catch the error of the plan not existing in the server
        alert('Sorry, no plan found in the cloud!');
      }
    });
  }

  public render() {
    const { plan } = this.props;
    if (!plan) {
      return <Loading />;
    }

    return (
      <div id="plan-completion-page-wrapper">
        <Helmet>
          <title>{`${MARK} ${plan.plan_title} ${AS} ${COMPLETE.toLocaleLowerCase()}`}</title>
        </Helmet>
        {/** prompt to confirm mark as complete click action */}
        <h2 className="mb-3 mt-5 page-title">{`${MARK} ${
          plan.plan_title
        } ${AS} ${COMPLETE.toLocaleLowerCase()}`}</h2>
        <hr />
        <div className="card mb-3">
          <div className="card-header">{MARK_AS_COMPLETE}</div>
          <div className="card-body">
            {/* this should be error handlers not links */}
            <p>{`${MARK} ${plan.plan_title} ${AS} ${COMPLETE.toLocaleLowerCase()}`}</p>
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
  const plan =
    getPlanById(state, ownProps.match.params.id) ||
    getPlanRecordById(state, ownProps.match.params.id);
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
