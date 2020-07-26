import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedJurisdictionSelectionsSlider } from '..';
import store from '../../../../../../store';
import { fetchTree } from '../../../../../../store/ducks/opensrp/hierarchies';
import { sampleHierarchy } from '../../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { fetchJurisdictionsMetadata } from '../../../../../../store/ducks/opensrp/jurisdictionsMetadata';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { jurisdictionsMetadataArray } from '../../../../../../store/ducks/tests/fixtures';
/** tests for slider view
 * : need to know that changes on the slider are rendered on the ui
 * : need to know that changes on the slider cause the correct changes in the backend
 */

describe('JurisdictionAssignment/Slider', () => {
  it('slider works correctly', () => {
    store.dispatch(fetchTree(sampleHierarchy));
    // prepare fixtures jurisdiction metadata so that it  works with mock hierarchy
    // it will be so that we select one leaf node in sampleHierarchy i.e Akros_1 3951
    const metaData = cloneDeep(jurisdictionsMetadataArray);
    metaData[0].key = '3951';

    store.dispatch(fetchJurisdictionsMetadata(metaData));

    const props = {
      plan: plans[1],
      rootJurisdictionId: '2942',
    };

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedJurisdictionSelectionsSlider {...props} />
      </Provider>
    );

    wrapper.update();

    // Akros_1 is selected by default during mount since it has a threshold of 80 > 0
    expect(wrapper.find('div.slider-section').text()).toMatchInlineSnapshot(
      `"Risk Label  0%00100"`
    );
    expect(wrapper.find('div.info-section').text()).toMatchInlineSnapshot(
      `"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS159"`
    );

    // simulate a change on the input slider. will set a thresh-hold value
    // that will not select any of the jurisdictions
    expect(toJson(wrapper)).toMatchSnapshot('asdfasdf');

    /** we really should not be doing this, but I am currently unable to simulate
     * the change event
     */
    (wrapper.find('InputRange').props() as any).onChange(81);

    // the risk value should be now different 2
    expect(wrapper.find('.risk-label').text()).toMatchInlineSnapshot(`"81%"`);

    // invoke the method that now actually causes the auto-selection to happen
    (wrapper.find('InputRange').props() as any).onChangeComplete(81);

    // the structure count should now be zero
    expect(wrapper.find('div.info-section').text()).toMatchInlineSnapshot(
      `"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS0"`
    );
  });
});
