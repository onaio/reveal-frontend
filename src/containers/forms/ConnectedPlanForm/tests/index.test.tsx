import { mount, shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import ConnectedPlanForm from '..';
import { defaultProps as defaultPlanFormProps } from '../../../../components/forms/PlanForm';
import store from '../../../../store';

it('renders without crashing', () => {
  shallow(
    <Provider store={store}>
      <ConnectedPlanForm />
    </Provider>
  );
});

it('renders correctly', () => {
  const wrapper = mount(
    <Provider store={store}>
      <ConnectedPlanForm />
    </Provider>
  );

  expect(wrapper.find('ConnectedPlanForm').props()).toEqual({
    ...defaultPlanFormProps,
    addPlan: expect.any(Function),
  });
  expect(wrapper.find('PlanForm').props()).toEqual({
    ...defaultPlanFormProps,
    addPlan: expect.any(Function),
  });
});
