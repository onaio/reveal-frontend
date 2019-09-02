import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import Helmet from 'react-helmet';
import { Router } from 'react-router';
import { CreateEditTeamView } from '..';
import { EDIT_TEAM_URL, NEW_TEAM } from '../../../../../constants';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

const history = createBrowserHistory();

describe('src/containers/pages/NewTeamView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders NewTeamView without crashing', () => {
    shallow(<CreateEditTeamView />);
  });

  it('renders NewTeamsView correctly', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${EDIT_TEAM_URL}/:id`,
        url: `${EDIT_TEAM_URL}/teamId`,
      },
      team: fixtures.team1,
    };
    const wrapper = mount(
      <Router history={history}>
        <CreateEditTeamView {...props} />
      </Router>
    );
    // look for crucial components or pages that should be displayed

    // expect a form
    expect(wrapper.find('form').length).toEqual(1);

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(NEW_TEAM);

    wrapper.unmount();
  });

  it('');
});
