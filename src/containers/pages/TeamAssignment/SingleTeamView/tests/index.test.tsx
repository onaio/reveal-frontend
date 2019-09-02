import ListView from '@onaio/list-view';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedSingleTeamView, { SingleTeamView } from '..';
import { SINGLE_TEAM_URL, TEAM } from '../../../../../constants';
import store from '../../../../../store';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

const history = createBrowserHistory();

describe('src/containers/pages/TeamAssignment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders SingleTeamView without crashing', () => {
    // clean test: check for conditions resulting in errors
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/teamId`,
      },
      team: fixtures.team1,
    };

    const shallowWrapper = shallow(
      <Router history={history}>
        <SingleTeamView {...props} />
      </Router>
    );
    shallowWrapper.unmount();
  });

  it('renders SingleTeamView correctly', () => {
    // clean test: check for stuff that can only be present if page loaded
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/teamId`,
      },
      team: fixtures.team1,
      teamMembers: fixtures.teamMember1,
    };

    const wrapper = mount(
      <Router history={history}>
        <SingleTeamView {...props} />
      </Router>
    );

    // check for page title is set
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(`${TEAM} - User_45`);

    // check for breadcrumbs is set
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot('HeaderBreadcrumb');

    // text wise : check for the team Name text - should be in the top-most tier header
    const pageTitle = wrapper.find('.page-title');
    expect(pageTitle.length).toEqual(1);
    expect(pageTitle.text()).toEqual(`User_45`);

    // check: team details div(snapshot)
    expect(toJson(wrapper.find('#team-details'))).toMatchSnapshot('TeamDetails');

    // check: team members div(snapshot)
    expect(wrapper.find(ListView).length).toEqual(1);
    wrapper.unmount();
  });

  it('Plays well with the store', () => {
    // it gets data from store correctly
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/1`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleTeamView {...props} />
        </Router>
      </Provider>
    );
    const passedProps = wrapper.find(SingleTeamView).props() as any;
    expect(passedProps.team).toEqual(fixtures.team1);
    expect(passedProps.teamMembers).toEqual(fixtures.teamMember1);
  });
});
