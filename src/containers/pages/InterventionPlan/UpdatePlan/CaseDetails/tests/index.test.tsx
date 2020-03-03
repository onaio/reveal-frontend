import {mount, shallow} from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import ConnectedCaseDetails, { CaseDetails } from '..';
import { OpenSRPService } from '../../../../../../services/opensrp';
import store from '../../../../../../store';
/** Test sequence
 *  - renders without crashing.
 *  - renders correctly - checks initial render
 *      - collapsible is not collapsed.
 *  - collapsible works correctly:
 *      - parse html text for correct content
 *  - works correctly with store
 *  - makes correct api calls
 */

const fetch = require('jest-fetch-mock');

const props = {
  eventId: '',
  service: OpenSRPService,
  event: {},
};

describe('src/containers/pages/interventionPlan/updateplan/caseDetials', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<CaseDetails {...props} />);
  });

  it('renders correctly', () => {
    const wrapper = mount(<CaseDetails {...props} />);
    // accordion is not collapsed
    expect(wrapper.text()).toMatchInlineSnapshot();
  });

  it('Accordion works correctly', () => {
    const wrapper = mount(<CaseDetails {...props} />);
    const cardHeader = wrapper.find('CardHeader');
    // simulate click on cardHeader(Case Details)
    cardHeader.simulate('click');
    wrapper.update();
    // The case details should now be visible
    expect(wrapper.text()).toMatchInlineSnapshot();
  });

  it('works correctly with store', () => {
    fetch.once(JSON.stringify({}));
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedCaseDetails {...props} />
      </Provider>
    );
    // should basically be able to render the correct output
    expect(wrapper.find(CaseDetails).text()).toMatchInlineSnapshot();
  });

  it('Makes the correct api calls', () => {
    fetch.once(JSON.stringify({}));
    const wrapper = mount(<CaseDetails {...props} />);
    expect(fetch).toHaveBeenCalledWith({});
  })
});
