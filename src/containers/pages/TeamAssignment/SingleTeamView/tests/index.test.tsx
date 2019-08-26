import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router';
import ConnectedSingleTeamView, { singleTeamView } from '..';
import { SINGLE_TEAM_URL } from '../../../../../constants';
import store from '../../../../../store';

const history = createBrowserHistory();

describe('src/containers/pages/TeamAssignment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders SingleTeamView without crashing', () => {
    // clean test: check for conditiions resulting in errors
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
    };

    const shallowWrapper = shallow(
      <Router history={history}>
        <singleTeamView {...props} />
      </Router>
    );

    // check props are as intendend;
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
    };

    const wrapper = mount(
      <Router history={history}>
        <singleTeamView {...props} />
      </Router>
    );

    // check for page title is set

    // check for breadcrumbs is set

    // text wise : check for the team Name text

    // check: team details div(snapshot)

    // check: team members div(snapshot)

    // check : 2 calls to action: view and remove

    wrapper.unmount();
  });
});
