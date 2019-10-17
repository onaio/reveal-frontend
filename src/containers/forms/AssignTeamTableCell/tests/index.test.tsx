import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Provider } from 'react-redux';
import AssignTeamTableCell from '..';
import store from '../../../../store';
import assignmentReducer, {
  reducerName as assignmentReducerName,
} from '../../../../store/ducks/opensrp/assignments';
import organizationsReducer, {
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/opensrp/organizations';

jest.mock('../../../../configs/env');

reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);

describe('/containers/forms/AssignTeamTableCell', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<AssignTeamTableCell />);
  });

  it('renders correctly', () => {
    const props = {
      assignPopover: <div id="custom-popover" />,
      jurisdictionId: 'outpost-number-one',
      planId: 'alpha',
    };

    const wrapper = mount(
      <Provider store={store}>
        <AssignTeamTableCell {...props} />
      </Provider>
    );
    expect(toJson(wrapper.find('button#plan-assignment-outpost-number-one'))).toMatchSnapshot(
      'AssignTeamButton'
    );
    expect(toJson(wrapper.find('span.assignment-label'))).toMatchSnapshot('Team Count Text');
  });
});
