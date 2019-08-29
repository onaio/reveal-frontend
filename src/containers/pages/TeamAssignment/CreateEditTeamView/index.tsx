/** New Team View page:
 * displays form that's used to create a new team or update openSRP api
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  CREATE_TEAM_URL,
  EDIT_TEAM,
  EDIT_TEAM_URL,
  HOME,
  HOME_URL,
  NEW_TEAM,
  TEAM_LIST_URL,
  TEAMS,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import TeamForm from '../../../forms/TeamForm';

export interface Props {
  team: { identifier: string } | null;
}

export const defaultProps: Props = {
  team: null,
};

export type CreateEditTeamViewTypes = Props & RouteComponentProps<RouteParams>;

const CreateEditTeamview = (props: CreateEditTeamViewTypes) => {
  const { team } = props;
  // use route to know if we are editing team or creating team
  const editing = !!props.match.params.id;
  //  props for breadcrumbs
  const basePage = {
    label: TEAMS,
    url: TEAM_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: editing ? EDIT_TEAM : NEW_TEAM,
      url: editing ? `${EDIT_TEAM_URL}/${team!.identifier}` : CREATE_TEAM_URL,
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
        <title />
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <TeamForm />
    </div>
  );
};

CreateEditTeamview.defaultProps = defaultProps;

export { CreateEditTeamview };

// connect to store

const ConnectedCreateEditTeamView = connect()(CreateEditTeamview);

export default ConnectedCreateEditTeamView;
