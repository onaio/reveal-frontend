/** New Team View page:
 * displays form that's used to create a new team or update openSRP api
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
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
import { Organization } from '../../../../store/ducks/organizations';
import * as fixtures from '../../../../store/ducks/tests/fixtures';
import TeamForm, { defaultInitialValues, TeamFormProps } from '../../../forms/TeamForm';

export interface Props {
  team: Organization | null;
}

export const defaultProps: Props = {
  team: null,
};

export type CreateEditTeamViewTypes = Props & RouteComponentProps<RouteParams>;

const CreateEditTeamView = (props: CreateEditTeamViewTypes) => {
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
  breadcrumbProps.pages = [homePage, basePage];

  const teamFormProps: TeamFormProps = {
    disabledFields: ['identifier'],
    initialValues: editing ? team! : defaultInitialValues,
    redirectAfterAction: TEAM_LIST_URL,
  };
  return (
    <div>
      <Helmet>
        <title>{NEW_TEAM}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <TeamForm {...teamFormProps} />
        </Col>
      </Row>
    </div>
  );
};

CreateEditTeamView.defaultProps = defaultProps;

export { CreateEditTeamView };

type DispatchedProps = Props;

// connect to store
const mapStateToprops = (
  state: Partial<Store>,
  ownProps: CreateEditTeamViewTypes
): DispatchedProps => {
  let teamId = ownProps.match.params.id;
  teamId = teamId ? teamId : '';
  const team = fixtures.teams.filter((tm: Organization) => tm.identifier === teamId)[0];
  return { team };
};

const ConnectedCreateEditTeamView = connect(mapStateToprops)(CreateEditTeamView);

export default ConnectedCreateEditTeamView;
