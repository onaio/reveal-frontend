/** Team Assignment component for listing all teams */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import InlineSearchForm, {
  Props as InlineSearchFormProps,
} from '../../../../components/InlineSearchForm';
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
  TEAM_LIST_URL,
  TEAMS,
} from '../../../../constants';
import teamsReducer, { reducerName as teamsReducerName, Team } from '../../../../store/ducks/teams';
import * as fixtures from '../../../../store/ducks/tests/fixtures';
import './index.css';

reducerRegistry.register(teamsReducerName, teamsReducer);

/** interface to describe our custom created SingleTeamView props */
interface TeamListViewProps {
  teams: Team[];
}

/** the default props for SingleTeamView */
const defaultListViewProps: TeamListViewProps = {
  teams: [],
};

/** the interface for all SingleTeamView props  */
export type TeamListViewPropsType = TeamListViewProps & RouteComponentProps;

const TeamListView = (props: TeamListViewPropsType) => {
  const { teams } = props;
  if (teams.length < 1) {
    return <Loading />;
  }
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: TEAMS,
      url: TEAM_LIST_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  // tslint:disable-next-line: no-empty
  function handleSubmit(event: React.FormEvent) {}

  const inlineSearchFormProps: InlineSearchFormProps = {
    handleSubmit,
    inputId: 'search',
    inputPlaceholder: 'Search teams',
  };

  const listViewProps = {
    data: teams.map((team: Team) => {
      return [
        <Link to={`${SINGLE_TEAM_URL}/${team.identifier}`} key={team.identifier}>
          {team.identifier}
        </Link>,
        <Link to={`${SINGLE_TEAM_URL}/${team.identifier}`} key={team.identifier}>
          {team.name}
        </Link>,
        ,
        team.jurisdictions,
      ];
    }),
    headerItems: ['#', 'Team Name', 'Area'],
    tableClass: 'table table-bordered',
  };

  const linkAsButtonProps = {
    text: NEW_TEAM,
    to: CREATE_TEAM_URL,
  };

  return (
    <div>
      <Helmet>
        <title>{`${TEAMS}(${teams.length})`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row id="header-row">
        <Col className="xs">
          {/** ? Should this be the number of teams in store or in the api */}
          <h2 className="mb-3 mt-5 page-title">{`${TEAMS}(${teams.length})`}</h2>
        </Col>
        <Col className="xs">
          <LinkAsButton {...linkAsButtonProps} />
        </Col>
      </Row>
      <hr />
      <InlineSearchForm {...inlineSearchFormProps} />

      <ListView {...listViewProps} />
    </div>
  );
};

TeamListView.defaultProps = defaultListViewProps;

export { TeamListView };

// connect to store

const mapStateToProps = (state: Partial<Store>) => {
  return {
    teams: fixtures.teams, // getTeamsArray(state),
  };
};

const ConnectedTeamListView = connect(mapStateToProps)(TeamListView);

export default ConnectedTeamListView;
