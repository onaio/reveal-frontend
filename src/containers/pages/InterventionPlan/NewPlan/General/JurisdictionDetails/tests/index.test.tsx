import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { JurisdictionDetails } from '..';

const planFormJurisdiction = {
  id: '1337',
  name: 'Kilimani 89',
};

describe('src/containers/pages/interventionPlan/NewPlan/JurisdictionDetials', () => {
  it('renders without crashing', () => {
    shallow(<JurisdictionDetails planFormJurisdiction={planFormJurisdiction} />);
  });

  it('renders correctly', () => {
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionDetails planFormJurisdiction={planFormJurisdiction} />
      </MemoryRouter>
    );
    expect(
      toJson(wrapper.find('#accordion-jurisdiction-deets Card CardHeader div'))
    ).toMatchSnapshot('Card header');
    expect(
      toJson(wrapper.find('#accordion-jurisdiction-deets Card Collapse CardBody'))
    ).toMatchSnapshot('Card body');
  });

  it('renders correctly when jurisdiction is falsey', () => {
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionDetails planFormJurisdiction={{ id: '', name: '' }} />
      </MemoryRouter>
    );
    expect(toJson(wrapper.find('JurisdictionDetails'))).toMatchSnapshot('null JurisdictionDetails');
  });
});
