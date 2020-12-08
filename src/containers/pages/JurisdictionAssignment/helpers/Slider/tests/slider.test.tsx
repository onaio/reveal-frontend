import { mount } from 'enzyme';
import { cloneDeep } from 'lodash';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { ConnectedJurisdictionSelectionsSlider } from '..';
import store from '../../../../../../store';
import { deforest, fetchTree } from '../../../../../../store/ducks/opensrp/hierarchies';
import { sampleHierarchy } from '../../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { fetchJurisdictionsMetadata } from '../../../../../../store/ducks/opensrp/jurisdictionsMetadata';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { jurisdictionsMetadataArray } from '../../../../../../store/ducks/tests/fixtures';

/** tests for slider view
 * : need to know that changes on the slider are rendered on the ui
 * : need to know that changes on the slider cause the correct changes in the backend
 */

describe('JurisdictionAssignment/Slider', () => {
  beforeEach(() => {
    deforest();
  });

  it('slider works correctly', () => {
    const hierarchy = cloneDeep(sampleHierarchy);

    // Add a node to the hierarchy
    (hierarchy as any).locationsHierarchy.map['2942'].children['3019'].children['1337'] = {
      id: '1337',
      label: 'Ona office',
      node: {
        attributes: {
          geographicLevel: 2,
          structureCount: 10,
        },
        locationId: '1337',
        name: 'Ona office',
        parentLocation: {
          locationId: '3019',
          voided: false,
        },
        voided: false,
      },
      parent: '3019',
    };

    store.dispatch(fetchTree(hierarchy));
    // prepare fixtures jurisdiction metadata so that it  works with mock hierarchy
    // we are specifically setting the jurisdiction ids so that they match what we
    // have in the hierarchy
    const metaData = cloneDeep(jurisdictionsMetadataArray);
    metaData[0].key = '3951';
    metaData[1].key = '1337';

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

    // Akros_1 and Ona office are selected by default, since threshold of both > 0
    expect(wrapper.find('div.slider-section').text()).toMatchInlineSnapshot(`"Risk  0%00100"`);
    expect(wrapper.find('div.info-section').length).toEqual(2);
    expect(
      wrapper
        .find('div.info-section')
        .first()
        .text()
    ).toMatchInlineSnapshot(`"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS169"`);
    expect(
      wrapper
        .find('div.info-section')
        .last()
        .text()
    ).toMatchInlineSnapshot(`"2 jurisdiction(s) selected"`);

    // simulate a change on the input slider. will set a thresh-hold value
    // that will deselect one of the jurisdictions

    /** we really should not be doing this, but I am currently unable to simulate
     * the change event
     */
    act(() => {
      (wrapper.find('InputRange').props() as any).onChange(71);
    });

    // the risk value should be now different 71%
    expect(wrapper.find('.risk-label').text()).toMatchInlineSnapshot(`"71%"`);

    // invoke the method that now actually causes the auto-selection to happen
    (wrapper.find('InputRange').props() as any).onChangeComplete(71);

    // the structure and jurisdiction counts should now reflect just Akros_1 being selected
    expect(
      wrapper
        .find('div.info-section')
        .first()
        .text()
    ).toMatchInlineSnapshot(`"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS159"`);
    expect(
      wrapper
        .find('div.info-section')
        .last()
        .text()
    ).toMatchInlineSnapshot(`"1 jurisdiction(s) selected"`);

    // simulate another change to deselect all jurisdictions
    /** we really should not be doing this, but I am currently unable to simulate
     * the change event
     */
    act(() => {
      (wrapper.find('InputRange').props() as any).onChange(81);
    });
    expect(wrapper.find('.risk-label').text()).toMatchInlineSnapshot(`"81%"`);
    (wrapper.find('InputRange').props() as any).onChangeComplete(81);
    // we should now have no jurisdictions selected
    expect(
      wrapper
        .find('div.info-section')
        .first()
        .text()
    ).toMatchInlineSnapshot(`"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS0"`);
    expect(
      wrapper
        .find('div.info-section')
        .last()
        .text()
    ).toMatchInlineSnapshot(`"0 jurisdiction(s) selected"`);
  });

  it('works when no value from API', () => {
    store.dispatch(fetchTree(sampleHierarchy));
    // set value to undefined
    const metaData = cloneDeep(jurisdictionsMetadataArray);
    metaData[0].key = '3951';
    (metaData[0].value as any) = undefined;

    store.dispatch(fetchJurisdictionsMetadata([metaData[0]]));

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

    expect(wrapper.find('div.info-section').length).toEqual(2);

    expect(
      wrapper
        .find('div.info-section')
        .first()
        .text()
    ).toMatchInlineSnapshot(`"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS159"`);
    expect(
      wrapper
        .find('div.info-section')
        .last()
        .text()
    ).toMatchInlineSnapshot(`"1 jurisdiction(s) selected"`);
  });
});
