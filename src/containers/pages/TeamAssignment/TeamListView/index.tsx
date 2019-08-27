/** Team Assignment component for listing all teams */
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, HOME_URL, SINGLE_TEAM_URL, TEAM, TEAM_LIST_URL, TEAMS } from '../../../../constants';
import teamsReducer, { reducerName as teamsReducerName, Team } from '../../../../store/ducks/teams';

reducerRegistry.register(teamsReducerName, teamsReducer);

/** interface to describe our custom created SingleTeamView props */
interface TeamListViewProps {
  teams: Team[];
}

/** the default props for SingleTeamView */
const defaultProps: TeamListViewProps = {
  teams: [],
};

/** the interface for all SingleTeamView props  */
type TeamListViewPropsType = TeamListViewProps & RouteComponentProps;

export const TeamListView = () => {
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

  return (
    <div>
      <Helmet>
        <title>{TEAMS}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Link to={`${SINGLE_TEAM_URL}/someid`}>To single component page view </Link>
    </div>
  );
};
