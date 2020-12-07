import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { format } from 'util';
import { BreadCrumbProps } from '../../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, PLANS, PLANS_USER_FILTER_NOTIFICATION } from '../../../../../../configs/lang';
import { HOME_URL, PLAN_LIST_URL } from '../../../../../../constants';
import { draftPlansPageBodyFactory } from '../utils';

const history = createBrowserHistory();
const homePage = {
  label: HOME,
  url: HOME_URL,
};
const breadCrumbProps: BreadCrumbProps = {
  currentPage: {
    label: PLANS,
    url: PLAN_LIST_URL,
  },
  pages: [homePage],
};

describe('planning view utils', () => {
  it('draftPlansPageBodyFactory: works correctly without user param', () => {
    const renderBody = draftPlansPageBodyFactory({
      breadCrumbProps,
      newPlanUrl: PLAN_LIST_URL,
      pageTitle: PLANS,
    });
    const element = () => <div className="test-class" />;
    const wrapper = mount(<Router history={history}>{renderBody(element)}</Router>);

    expect(wrapper.find('.page-title').text()).toEqual(PLANS);
    expect(wrapper.find('.create-plan a').text()).toEqual('Create New Plan');
    expect(wrapper.find('Col p').length).toBeFalsy();
    expect(wrapper.find('.test-class').length).toEqual(1);
  });

  it('draftPlansPageBodyFactory: works correctly with user param', () => {
    const userParam = 'TestsUser';
    const renderBody = draftPlansPageBodyFactory({
      breadCrumbProps,
      newPlanUrl: PLAN_LIST_URL,
      pageTitle: PLANS,
      userParam,
    });
    const element = () => <div className="test-class" />;
    const wrapper = mount(<Router history={history}>{renderBody(element)}</Router>);

    expect(wrapper.find('.page-title').text()).toEqual(PLANS);
    expect(wrapper.find('.create-plan a').text()).toEqual('Create New Plan');
    expect(wrapper.find('Col p').length).toBeTruthy();
    expect(wrapper.find('Col p').text()).toEqual(format(PLANS_USER_FILTER_NOTIFICATION, userParam));
    expect(wrapper.find('.test-class').length).toEqual(1);
  });
});
