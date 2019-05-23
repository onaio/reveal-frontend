import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import GisidaWrapper from '../../../../../components/GisidaWrapper';
import Loading from '../../../../../components/page/Loading';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLANS_SLICE,
} from '../../../../../configs/env';
import { FOCUS_INVESTIGATION } from '../../../../../constants';
import { FlexObject, RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import goalsReducer, {
  fetchGoals,
  getGoalsArrayByPlanId,
  Goal,
  reducerName as goalsReducerName,
} from '../../../../../store/ducks/goals';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import plansReducer, {
  fetchPlans,
  getPlanById,
  getPlansArray,
  getPlansIdArray,
  Plan,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import './style.css';

/** register reducers */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(goalsReducerName, goalsReducer);
reducerRegistry.register(plansReducerName, plansReducer);

/** interface to describe props for ActiveFI Map component */
export interface MapSingleFIProps {
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlans;
  goals: Goal[] | null;
  jurisdiction: Jurisdiction | null;
  plan: Plan | null;
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI Map component */
export const defaultMapSingleFIProps: MapSingleFIProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  goals: fixtures.plan1Goals,
  jurisdiction: fixtures.jurisdictions[0],
  plan: fixtures.plan1,
};
/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<
  RouteComponentProps<RouteParams> & MapSingleFIProps,
  FlexObject
> {
  public static defaultProps = defaultMapSingleFIProps;
  constructor(props: RouteComponentProps<RouteParams> & MapSingleFIProps) {
    super(props);
  }

  public async componentDidMount() {
    const {
      fetchGoalsActionCreator,
      fetchJurisdictionsActionCreator,
      fetchPlansActionCreator,
    } = this.props;
    await supersetFetch(SUPERSET_JURISDICTIONS_SLICE).then((result: Jurisdiction[]) =>
      fetchJurisdictionsActionCreator(result)
    );
    await supersetFetch(SUPERSET_PLANS_SLICE).then((result2: Plan[]) =>
      fetchPlansActionCreator(result2)
    );
    await supersetFetch(SUPERSET_GOALS_SLICE).then((result3: Goal[]) =>
      fetchGoalsActionCreator(result3)
    );
  }
  public render() {
    const { jurisdiction, plan, goals } = this.props;

    if (!goals || !jurisdiction || !plan) {
      return <Loading />;
    }

    return (
      <div>
        <h2 className="page-title mt-4 mb-4">
          {FOCUS_INVESTIGATION}: {plan && plan.jurisdiction_name ? plan.jurisdiction_name : null}
        </h2>
        <div className="row no-gutters">
          <div className="col-9">
            <div className="map">
              <GisidaWrapper handlers={this.buildHandlers()} geoData={jurisdiction} />
            </div>
          </div>
          <div className="col-3">
            <div className="mapSidebar">
              <h5>Responses</h5>
              <hr />
              {goals &&
                goals.map((item: Goal) => {
                  return (
                    <div className="responseItem" key={item.goal_id}>
                      <h6>{item.action_code}</h6>
                      <div className="targetItem">
                        <p>Measure: {item.measure}</p>
                        <p>
                          Target: {item.task_count} of {item.goal_value}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private buildHandlers() {
    const self = this;
    const handlers = [
      {
        method: function drillDownClick(e: any) {
          const features = e.target.queryRenderedFeatures(e.point);
          if (features[0] && Number(features[0].id) !== Number(self.props.match.params.id)) {
            self.props.history.push(`/focus-investigation/map/${features[0].id}`);
          }
        },
        name: 'drillDownClick',
        type: 'click',
      },
    ];
    return handlers;
  }
}
/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any) => {
  // pass in the plan id to get plan the get the jurisdicytion_id from the plan
  const plan = getPlanById(state, ownProps.match.params.id);
  let goals = null;
  let jurisdiction = null;
  if (plan) {
    jurisdiction = getJurisdictionById(state, plan.jurisdiction_id);
    goals = getGoalsArrayByPlanId(state, plan.plan_id);
  }
  return {
    goals,
    jurisdiction,
    plan,
    plansArray: getPlansArray(state),
    plansIdArray: getPlansIdArray(state),
  };
};

const mapDispatchToProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
};
const ConnectedMapSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleActiveFIMap);

export default ConnectedMapSingleFI;
