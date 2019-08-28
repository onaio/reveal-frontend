/** Team Assignment component for listing all teams */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Row } from 'reactstrap';
import { Store } from 'redux';
import InlineSearchForm, {
  Props as InlineSearchFormProps,
} from '../../../../components/InlineSearchForm';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, HOME_URL } from '../../../../constants';
import teamsReducer, { reducerName as teamsReducerName, Team } from '../../../../store/ducks/teams';

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
type TeamListViewPropsType = TeamListViewProps & RouteComponentProps;

const TeamListView = (props: TeamListViewPropsType) => {
  const { teams } = props;
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: `teams`,
      url: `/teams`,
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
    data: teams.map((team: any) => {
      return [
        team.name,
        team.identifier,
        team.location,
        team.supervisor,
        ``,
        <Link to={`single team view`} key={team.identifier}>
          view
        </Link>,
      ];
    }),
    headerItems: ['Team Name', 'Identifier', 'Location', 'Supervisor', 'Members No.', 'Actions'],
    tableClass: 'table-striped',
  };

  return (
    <div>
      <Helmet>
        <title>{`TEAMS`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <div>
        <h2 className="mb-3 mt-5 page-title">{`Team Name`}</h2>
        <br />
        <Link to={`add new team`}>
          <FontAwesomeIcon icon={['fas', 'plus']} /> Add Team
        </Link>
      </div>
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
    teams: getTeamsArray(state),
  };
};

const ConnectedTeamListView = connect(mapStateToProps)(TeamListView);

export default ConnectedTeamListView;
