import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Accordion } from '..';

describe('src/components/page/Accordion', () => {
  it('works correctly', () => {
    const props = {
      accordionId: 'accordionId',
      accordions: [
        {
          accordionBody: () => (
            <div className="winston">History will be kind to me for I intend to write it</div>
          ),
          cardHeaderId: `card-header`,
          collapsibleBodyId: `collapsible-body`,
          headerText: 'TRIGGERS_LABEL',
        },
      ],
    };
    const wrapper = mount(<Accordion {...props} />);

    expect(toJson(wrapper.find('card-header'))).toMatchSnapshot('card-header');

    expect(toJson(wrapper.find('#collapsible-body'))).toMatchSnapshot('collapsed');

    // starts in a collapsed state.
    expect(wrapper.find('#collapsible-body').hasClass('show')).toBeFalsy();
  });
});
