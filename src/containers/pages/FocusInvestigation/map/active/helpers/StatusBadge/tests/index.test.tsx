import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as React from 'react';
import StatusBadge from '..';
import * as fixtures from '../../../../../../../../store/ducks/tests/fixtures';

describe('containers/pages/FocusInvestigation/active/map/helpers/MarkCompleteLink', () => {
  it('renders correctly', () => {
    const props = {
      plan: fixtures.draftPlan,
    };
    const wrapper = mount(<StatusBadge {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders correctly if plan status is active ', () => {
    const props = {
      plan: fixtures.plan1,
    };
    const wrapper = mount(<StatusBadge {...props} />);
    expect(wrapper.find('Badge').prop('color')).toEqual('warning');
    wrapper.unmount();
  });

  it('renders correctly if plan status is complete ', () => {
    const props = {
      plan: fixtures.completeRoutinePlan,
    };
    const wrapper = mount(<StatusBadge {...props} />);
    expect(wrapper.find('Badge').prop('color')).toEqual('success');
    wrapper.unmount();
  });

  it('renders correctly if plan status is retired ', () => {
    const props = {
      plan: fixtures.retiredPlan,
    };
    const wrapper = mount(<StatusBadge {...props} />);
    expect(wrapper.find('Badge').prop('color')).toEqual('success');
    wrapper.unmount();
  });
});
