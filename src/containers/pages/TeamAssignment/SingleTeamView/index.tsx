/** The Single Teams view page:
 * lists details pertaining to a specific team
 */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { values } from 'lodash';
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
import {
  CREATE_TEAM_URL,
  HOME,
  HOME_URL,
  NEW_TEAM,
  SINGLE_TEAM_URL,
  TEAM,
  TEAM_DETAILS,
  TEAM_LIST_URL,
  TEAM_MEMBERS,
  TEAMS,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import teamsReducer, {
  getTeamById,
  reducerName as teamsReducerName,
  Team,
} from '../../../../store/ducks/teams';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

reducerRegistry.register(teamsReducerName, teamsReducer);

/** interface to describe our custom created SingleTeamView props */
interface SingleTeamViewProps {
  team: Team | null;
  teamMembers?: [
    {
      [key: string]: string;
    }
  ];
}

/** the default props for SingleTeamView */
const defaultProps: SingleTeamViewProps = {
  team: null,
};

/** the interface for all SingleTeamView props  */
type SingleTeamViewPropsType = SingleTeamViewProps & RouteComponentProps<RouteParams>;

const SingleTeamView = (props: SingleTeamViewPropsType) => {
  const { team, teamMembers } = props;

  if (!team) {
    return <Loading />;
  }

  const basePage = {
    label: TEAMS,
    url: TEAM_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: team.identifier,
      url: `${SINGLE_TEAM_URL}/${team.identifier}`,
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
    data: teamMembers!.map((teamMember: any) => values(teamMember)),
    headerItems: ['#', 'Username', 'Name', 'Team'],
    tableClass: 'table table-bordered',
  };

  // LinkAsButton Props
  const linkAsButtonProps = {
    text: NEW_TEAM,
    to: CREATE_TEAM_URL,
  };

  return (
    <div>
      <Helmet>
        <title>{`${TEAM} - ${team.name}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <br />
      <Row>
        <Col className="xs">
          <h2 className="mb-3 mt-5 page-title">{team.name}</h2>
        </Col>
        <Col className="link-as-button xs">
          <LinkAsButton {...linkAsButtonProps} />
        </Col>
      </Row>
      <hr />
      <div id="team-details" className="card mb-3">
        <div className="card-header">{TEAM_DETAILS}</div>
        <div className="card-body">
          {/* the below display should be in 2 cols*/}
          <Row>
            <Col className="col-6">
              <Row>
                <Col className="col-6">Identifier</Col>
                <Col className="col-6">{team.identifier}</Col>
              </Row>
            </Col>
            <Col className="col-6">
              <Row>
                <Col className="col-6">Name</Col>
                <Col className="col-6">{team.name}</Col>
              </Row>
            </Col>
            <Col className="col-6">
              <Row>
                <Col className="col-6">Description</Col>
                <Col className="col-6">Lorem Ipsum</Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
      <h3 className="mb-3 mt-5 page-title">{TEAM_MEMBERS}</h3>
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
  teamMembers: any;
}

/** Maps a prop to a selector from the teams dux module */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: SingleTeamViewPropsType
): MapStateToProps => {
  let teamId = ownProps.match.params.id;
  teamId = teamId ? teamId : '';
  const team = fixtures.teams.filter(tm => tm.identifier === teamId)[0]; // getTeamById(state, teamId);
  const teamMembers = fixtures.teamMembers.filter(teamMember => teamMember.team === team.name);
  return {
    team,
    teamMembers,
  };
};

/** The connected component */
const ConnectedSingleTeamView = connect(mapStateToProps)(SingleTeamView);

export default ConnectedSingleTeamView;
