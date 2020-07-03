import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HeaderBreadcrumb from '../../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import BaseNewPlan, NewPlan, { NewIRSPlan, NewPlanForPlanning } from '../index';
import { IRSPlanFormProps, planFormProps, planningFormProps } from './fixtures';

const history = createBrowserHistory();

describe('containers/pages/NewPlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<BaseNewPlan />);
  });

  it('renders correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <BaseNewPlan />
      </Router>
    );

    // check that page title is displayed
    expect(toJson(wrapper.find('h3.mb-3.page-title'))).toMatchSnapshot('page title');

    // check that PlanForm receives the correct props
    expect(wrapper.find('PlanForm').props()).toMatchSnapshot({
      formHandler: expect.any(Function),
    });
    // check that there's a Row that nests a Col that nests a PlanForm
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('Row').find('Col')).toHaveLength(2);
    expect(
      wrapper
        .find('Row')
        .find('Col#planform-col-container')
        .find('PlanForm')
    ).toHaveLength(1);

    // test that JurisdictionDetails are shown
    // set jurisdiction id ==> we use Formik coz React-Select is acting weird
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Onyx' } });

    expect(wrapper.find('JurisdictionDetails').props()).toEqual({
      planFormJurisdiction: { id: '1337', name: 'Onyx' },
    });

    wrapper.update();

    // change to IRS
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'IRS' } });
    wrapper.update();
    expect(wrapper.find('JurisdictionDetails').length).toEqual(0);

    wrapper.unmount();
  });

  it('renders text correctly for New Plan in planning tool ', () => {
    const wrapper = mount(
      <Router history={history}>
        <NewPlanForPlanning />
      </Router>
    );

    // check that PlanForm receives the correct props
    expect(wrapper.find('PlanForm').props()).toEqual({
      ...planningFormProps,
      formHandler: expect.any(Function),
    });

    expect(wrapper.find(HeaderBreadcrumb).text()).toMatchInlineSnapshot(
      `"HomeDraft plansCreate New Plan"`
    );

    // does not show Jurisdiction Details
    expect(wrapper.find('JurisdictionDetails').length).toEqual(0);

    wrapper.unmount();
  });
  it('render correctly for New IRS plan', () => {
    const wrapper = mount(
      <Router history={history}>
        <NewIRSPlan />
      </Router>
    );

    // check that PlanForm receives the correct props
    expect(wrapper.find('PlanForm').props()).toEqual({
      ...IRSPlanFormProps,
      formHandler: expect.any(Function),
    });

    expect(wrapper.find(HeaderBreadcrumb).text()).toMatchInlineSnapshot(
      `"HomeIRS Plans (drafts)Create New Plan"`
    );

    // does not show Jurisdiction Details
    expect(wrapper.find('JurisdictionDetails').length).toEqual(0);

    wrapper.unmount();
  });
});
