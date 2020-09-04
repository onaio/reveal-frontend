import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { computeEstimate, ConnectedResourceWidget, ResourceCalculation } from '..';
import store from '../../../../../../store';
import { fetchTree, selectNode } from '../../../../../../store/ducks/opensrp/hierarchies';
import { META_STRUCTURE_COUNT } from '../../../../../../store/ducks/opensrp/hierarchies/constants';
import { raZambiaHierarchy } from '../../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { generateJurisdictionTree } from '../../../../../../store/ducks/opensrp/hierarchies/utils';

const rootId = '0ddd9ad1-452b-4825-a92a-49cb9fc82d18';
const planId = 'randomPlanId';
store.dispatch(fetchTree(raZambiaHierarchy));
store.dispatch(selectNode(rootId, rootId, planId));

const rootNode = generateJurisdictionTree(raZambiaHierarchy);

const props = {
  planId,
  rootId,
};

describe('jurisdiction Assignment/Resource calculation', () => {
  it('renders without crashing', () => {
    shallow(<ResourceCalculation {...props} />);
  });

  it('renders correctly', () => {
    const currentParentNode = cloneDeep(rootNode);
    currentParentNode.model.meta[META_STRUCTURE_COUNT] = 908;
    const otherProps = {
      ...props,
      selectedTreeCurrentParentNode: currentParentNode,
    };
    const wrapper = mount(<ResourceCalculation {...otherProps} />);

    expect(wrapper.find('h3.section-title').text()).toMatchInlineSnapshot(
      `"Resource Estimate for ra Zambia"`
    );

    expect(wrapper.find('form').text()).toMatchInlineSnapshot(
      `"0 daysat a rate of   structures per team per day with  Teams"`
    );
  });

  it('computes the time estimates correctly', () => {
    // need to compute for nominal case
    let res = computeEstimate(30, 10, 3);
    expect(res).toEqual(1);

    // fraction days
    res = computeEstimate(31, 10, 3);
    expect(res).toEqual(2);

    // division by zero error
    res = computeEstimate(3, 0, 2);
    expect(res).toEqual(0);
    res = computeEstimate(3, 10, 0);
    expect(res).toEqual(0);
  });

  it('uses user values to compute time estimates correctly', () => {
    // 2 cases:
    // - there is data.
    // user backspaces such that there is no data
    const currentParentNode = cloneDeep(rootNode);
    currentParentNode.model.meta[META_STRUCTURE_COUNT] = 30;
    const otherProps = {
      ...props,
      selectedTreeCurrentParentNode: currentParentNode,
    };
    const wrapper = mount(<ResourceCalculation {...otherProps} />);

    // initial input values
    expect(wrapper.find('input[name="structuresCount"]').props().value).toEqual(0);
    expect(wrapper.find('input[name="teamsCount"]').props().value).toEqual(0);

    // simulate structure count change so that we can have 10 structures per team
    expect(toJson(wrapper.find('input[name="structuresCount"]'))).toMatchSnapshot(
      'structures count input'
    );
    wrapper
      .find('input[name="structuresCount"]')
      .simulate('change', { target: { value: 10, name: 'structuresCount' } });
    wrapper.update();

    expect(wrapper.find('input[name="structuresCount"]').props().value).toEqual(10);
    expect(wrapper.find('input[name="teamsCount"]').props().value).toEqual(0);

    // see if there has been any change to the number of days, should start with 0 days
    expect(wrapper.find('form p').text()).toMatchInlineSnapshot(
      `"0 daysat a rate of   structures per team per day with  Teams"`
    );

    // simulate teams count change so that we have 3 teams
    expect(toJson(wrapper.find('input[name="teamsCount"]'))).toMatchSnapshot(
      'structures count input'
    );
    wrapper
      .find('input[name="teamsCount"]')
      .simulate('change', { target: { value: 3, name: 'teamsCount' } });
    wrapper.update();

    expect(wrapper.find('input[name="structuresCount"]').props().value).toEqual(10);
    expect(wrapper.find('input[name="teamsCount"]').props().value).toEqual(3);

    // see if there has been any change to the number of days, should start with 1 days
    expect(wrapper.find('form p').text()).toMatchInlineSnapshot(
      `"1 daysat a rate of   structures per team per day with  Teams"`
    );

    // backspace teams so that we have no data, value would be ""
    wrapper
      .find('input[name="teamsCount"]')
      .simulate('change', { target: { value: '', name: 'teamsCount' } });
    wrapper.update();

    expect(wrapper.find('input[name="structuresCount"]').props().value).toEqual(10);
    expect(wrapper.find('input[name="teamsCount"]').props().value).toEqual('');

    // see if there has been any change to the number of days, should start with 0 days
    expect(wrapper.find('form p').text()).toMatchInlineSnapshot(
      `"0 daysat a rate of   structures per team per day with  Teams"`
    );
  });

  it('works with store', () => {
    const otherProps = {
      ...props,
      currentParentId: rootId,
    };
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedResourceWidget {...otherProps} />
      </Provider>
    );

    expect(wrapper.text().includes(rootNode.model.label)).toBeTruthy();
  });
});
