/** The Single Teams view page:
 * lists details pertaining to a specific team
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
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
  return (
    <div>
      <Helmet>
        <title>{`${TEAM} - ${`Team Name`}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Link to={TEAM_LIST_URL}>
        <FontAwesomeIcon icon={['fas', 'arrow-left']} /> Back To Teams
      </Link>
      <br />
      <h2 className="mb-3 mt-2 page-title">{`Team Name`}</h2>
      <Button outline={true} color="primary">
        {`Edit Team`}
      </Button>
      <hr />
      <div className="card mb-3">
        <div className="card-header">{`Team Details`}</div>
        <div className="card-body">
          {/* the below display should be in 2 cols*/}
          <Row>
            <Col className="col-6">
              <Row>
                <Col className="col-6">Name</Col>
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
                <Col className="col-6">Name</Col>
                <Col className="col-6">Teng</Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-header">{`Team Members`}</div>
        <div className="card-body">
          <Table>
            <thead>
              <tr>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th colSpan={2}>Actions </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TobiMayowa</td>
                <td>Waiyapi</td>
                <td>Wanke</td>
                <td>
                  {' '}
                  <Link to={'/404'}> view</Link>
                </td>
                <td>
                  {' '}
                  <Link to={'/404'}> Remove</Link>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

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
