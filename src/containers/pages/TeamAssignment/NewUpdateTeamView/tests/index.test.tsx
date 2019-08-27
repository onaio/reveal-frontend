import { mount, shallow } from 'enzyme';
import { NewUpdateTeamView } from '..';

describe('src/containers/pages/NewTeamView', () => {
  it('renders NewTeamView without crashing', () => {
    shallow(<NewUpdateTeamView />);
  });

  it('renders NewTeamsView correctly', () => {
    const wrapper = mount(<NewUpdateTeamView />);
    // look for crucial components or pages that should be displayed

    // expect a form
    expect(wrapper.find('form').length).toEqual(1);

    // takes us back to teams
    const backToOrganisationsLink = wrapper.find('');
    backToOrganisationsLink.simulate('click');
    wrapper.update();
    // find the new url
    // -> here
    wrapper.unmount();
  });

  it('E2E for clean data works correctly', () => {
    const wrapper = mount(<NewUpdateTeamView />);

    // Simulate correct inputs and confirm submission
    expect.assertions(6);
    wrapper.unmount();
  });

  it('E2E simulation for invalid input data', () => {
    const wrapper = mount(<NewUpdateTeamView />);

    // simulate wrong inputs check for error
    // submission should fail
  });

  it('');
});
