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
  PLAN_LIST_URL,
} from '../../../../../constants';
import { FlexObject } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import {
  fetchPlans,
  getPlanById,
  Plan,
  PlanPayload,
  PlanStatus,
} from '../../../../../store/ducks/plans';

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

    // get the plan as it exists in the OpenSRP Server
    await service.read(planToconfirm.plan_id).then((planPayload: PlanPayload) => {
      if (planPayload && JSON.stringify(planPayload) !== '{}') {
        // set the plan status to complete
        const thePlan: PlanPayload = {
          ...planPayload,
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
