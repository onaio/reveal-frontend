/** The Single Teams view page:
 * lists details pertaining to a specific team
 */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { HOME, HOME_URL, SINGLE_TEAM_URL, TEAM, TEAM_LIST_URL, TEAMS } from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import teamsReducer, {
  getTeamById,
  reducerName as teamsReducerName,
  Team,
} from '../../../../store/ducks/teams';

reducerRegistry.register(teamsReducerName, teamsReducer);

/** interface to describe our custom created SingleTeamView props */
interface SingleTeamViewProps {
  team: Team | null;
}

/** the default props for SingleTeamView */
const defaultProps: SingleTeamViewProps = {
  team: null,
};

/** the interface for all SingleTeamView props  */
type SingleTeamViewPropsType = SingleTeamViewProps & RouteComponentProps<RouteParams>;

const SingleTeamView = (props: SingleTeamViewPropsType) => {
  const { team } = props;

  if (!team) {
    return <Loading />;
  }

  const basePage = {
    label: TEAMS,
    url: TEAM_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: `team.name`,
      url: `${SINGLE_TEAM_URL}/${`team.id`}`,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage, basePage];

  // listViewProps for team members
  const listViewProps = {
    data: [['1', 'User_45', 'Sam Sam', 'User_45'], ['2', 'Bob', 'joe', 'South']],
    headerItems: ['#', 'Username', 'Name', 'Team'],
    tableClass: 'table table-bordered',
  };

  // LinkAsButton Props
  const linkAsButtonProps = {
    text: 'Add New Team',
    to: `teams/new`,
  };

  return (
    <div>
      <Helmet>
        <title>{`${TEAM} - ${`Team Name`}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <br />
      <Row>
        <col className="xs">
          <h2 className="mb-3 mt-5 page-title">{`Team Name`}</h2>
        </col>
        <col className="xs" style={{ float: 'right' }}>
          <LinkAsButton {...linkAsButtonProps} />
        </col>
      </Row>
      <hr />
      <div id="team-details" className="card mb-3">
        <div className="card-header">{`Team Details`}</div>
        <div className="card-body">
          {/* the below display should be in 2 cols*/}
          <Row>
            <Col className="col-6">
              <Row>
                <Col className="col-6">identifier</Col>
                <Col className="col-6">Teng</Col>
              </Row>
            </Col>
            <Col className="col-6">
              <Row>
                <Col className="col-6">Name</Col>
                <Col className="col-6">Teng</Col>
              </Row>
            </Col>
            <Col className="col-6">
              <Row>
                <Col className="col-6">Description</Col>
                <Col className="col-6">Teng</Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
      <h3 className="mb-3 mt-5 page-title">{`Team Members`}</h3>
      <ListView {...listViewProps} />
    </div>
  );
};

SingleTeamView.defualtProps = defaultProps;

export { SingleTeamView };

// connecting the component to the store

/** interface to describe props from mapStateToProps */
interface MapStateToProps {
  team: Team | null;
}

/** Maps a prop to a selector from the teams dux module */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: SingleTeamViewPropsType
): MapStateToProps => {
  let teamId = ownProps.match.params.id;
  teamId = teamId ? teamId : '';
  const team = getTeamById(state, teamId);
  return {
    team,
  };
};

/** The connected component */
const ConnectedSingleTeamView = connect(mapStateToProps)(SingleTeamView);

export default ConnectedSingleTeamView;
