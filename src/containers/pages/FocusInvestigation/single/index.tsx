// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import GisidaWrapper from '../../../../components/GisidaWrapper';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLANS_SLICE,
} from '../../../../configs/env';
import {
  ACTIVE_INVESTIGATION,
  CANTON,
  COMPLETE,
  DISTRICT,
  FI_REASON,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_STATUS,
  FI_URL,
  FOCUS_AREA_INFO,
  FOCUS_INVESTIGATION,
  FOCUS_INVESTIGATIONS,
  HOME,
  HOME_URL,
  IN,
  MARK_AS_COMPLETE,
  MEASURE,
  NO,
  OF,
  RESPONSE,
  TARGET,
} from '../../../../constants';
import { getGoalReport } from '../../../../helpers/indicators';
import ProgressBar from '../../../../helpers/ProgressBar';
import { extractPlan, RouteParams, transformValues } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import goalsReducer, {
  fetchGoals,
  getGoalsByPlanAndJurisdiction,
  Goal,
  reducerName as goalsReducerName,
} from '../../../../store/ducks/goals';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../store/ducks/jurisdictions';
import plansReducer, {
  fetchPlans,
  getPlanById,
  getPlansArray,
  getPlansIdArray,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import './single.css';

/** register the goals reducer */
reducerRegistry.register(goalsReducerName, goalsReducer);
/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);
/** register the jurisdictions reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** interface to describe props for ActiveFI component */
export interface SingleFIProps {
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlans;
  goalsArray: Goal[];
  jurisdiction: Jurisdiction | null;
  planById: Plan | null;
  plansArray: Plan[];
  plansIdArray: string[];
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI component */
export const defaultSingleFIProps: SingleFIProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  goalsArray: [],
  jurisdiction: null,
  planById: null,
  plansArray: [],
  plansIdArray: [],
  supersetService: supersetFetch,
};

/** Reporting for Single Active Focus Investigation */
class SingleFI extends React.Component<RouteComponentProps<RouteParams> & SingleFIProps, {}> {
  public static defaultProps = defaultSingleFIProps;
  constructor(props: RouteComponentProps<RouteParams> & SingleFIProps) {
    super(props);
  }

  public async componentDidMount() {
    const {
      fetchGoalsActionCreator,
      fetchJurisdictionsActionCreator,
      fetchPlansActionCreator,
      supersetService,
    } = this.props;
    await supersetService(SUPERSET_PLANS_SLICE).then((result: Plan[]) =>
      fetchPlansActionCreator(result)
    );
    await supersetService(SUPERSET_GOALS_SLICE).then((result2: Goal[]) =>
      fetchGoalsActionCreator(result2)
    );
    await supersetFetch(SUPERSET_JURISDICTIONS_SLICE).then((result: Jurisdiction[]) =>
      fetchJurisdictionsActionCreator(result)
    );
  }

  public render() {
    const { goalsArray, jurisdiction, planById } = this.props;
    const theGoals = goalsArray;

    if (!planById || !theGoals || !jurisdiction) {
      return <Loading />;
    }

    let theObject = extractPlan(planById);
    const propertiesToTransform = [
      'village',
      'canton',
      'district',
      'provice',
      'jurisdiction_id',
      'focusArea',
    ];
    theObject = transformValues(theObject, propertiesToTransform);
    const basePage = {
      label: FOCUS_INVESTIGATIONS,
      url: FI_URL,
    };
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: theObject.focusArea,
        url: `${FI_SINGLE_URL}/${planById.id}`,
      },
      pages: [],
    };
    const namePaths =
      planById.jurisdiction_name_path instanceof Array ? planById.jurisdiction_name_path : [];
    const pages = namePaths.map(namePath =>
      // return a page object for each name path
      ({
        label: namePath,
        url: '',
      })
    );
    breadCrumbProps.pages = [homePage, basePage, ...pages];

    return (
      <div className="mb-5">
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title mt-4 mb-5">
          &nbsp;&nbsp;{FOCUS_INVESTIGATIONS} {IN} {theObject.focusArea}
        </h2>
        <Row>
          <Col className="col-6">
            <h4 className="mb-4">{FOCUS_AREA_INFO}</h4>
            {theObject.jurisdiction_id && (
              <div className="map-area">
                <GisidaWrapper geoData={jurisdiction} minHeight="200px" />
              </div>
            )}
            <dl className="row mt-3">
              <dt className="col-5">{DISTRICT}</dt>
              <dd className="col-7">{theObject.district}</dd>
              <dt className="col-5">{CANTON}</dt>
              <dd className="col-7">{theObject.canton}</dd>
              <dt className="col-5">{FI_REASON}</dt>
              <dd className="col-7">{theObject.reason}</dd>
              <dt className="col-5">{FI_STATUS}</dt>
              <dd className="col-7">{theObject.status}</dd>
            </dl>
            <hr />
          </Col>
          <Col className="col-6">
            <div className="fi-active">
              <h5 className="mb-4 mt-1">
                <Link to={`${FI_SINGLE_MAP_URL}/${theObject.id}`}>
                  {theObject.jurisdiction_id && (
                    <span>
                      <FontAwesomeIcon icon={['fas', 'map']} />
                      &nbsp;
                    </span>
                  )}
                  {ACTIVE_INVESTIGATION}: {theObject.plan_title}
                </Link>
              </h5>
              <dl className="row mt-3">
                <dt className="col-5">{COMPLETE}</dt>
                <dd className="col-7">{NO}</dd>
              </dl>
              <hr />
              <h5 className="mb-4 mt-4">{RESPONSE}</h5>

              {/** loop through the goals */
              theGoals.map((item: Goal) => {
                const goalReport = getGoalReport(item);
                return (
                  <div className="responseItem" key={item.goal_id}>
                    <h6>{item.action_code}</h6>
                    <div className="targetItem">
                      <p>
                        {MEASURE}: {item.measure}
                      </p>
                      <p>
                        {TARGET}: {goalReport.prettyPercentAchieved} ({goalReport.achievedValue}{' '}
                        {OF} {goalReport.targetValue})
                      </p>
                      <ProgressBar value={goalReport.percentAchieved} max={1} />
                    </div>
                  </div>
                );
              })}
              <Row className="mt-5">
                <Col className="col-6 offset-md-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-block"
                    disabled={true}
                  >
                    {MARK_AS_COMPLETE}
                  </button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export { SingleFI };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plansArray: Plan[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const plan = getPlanById(state, ownProps.match.params.id);
  let goalsArray = null;
  let jurisdiction = null;
  if (plan) {
    goalsArray = getGoalsByPlanAndJurisdiction(state, plan.plan_id, plan.jurisdiction_id);
    jurisdiction = getJurisdictionById(state, plan.jurisdiction_id);
  }
  const result = {
    goalsArray,
    jurisdiction,
    planById: plan,
    plansArray: getPlansArray(state),
    plansIdArray: getPlansIdArray(state),
  };
  return result;
};

const mapDispatchToProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
};

/** create connected component */

/** Connected SingleFI component */
const ConnectedSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleFI);

export default ConnectedSingleFI;
