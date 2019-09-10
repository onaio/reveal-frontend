import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import MockDate from 'mockdate';
import React from 'react';
import { Router } from 'react-router';
import {
  childrenByParentId,
  irsPlanDefinition1,
  irsPlanRecord1,
  jurisdictionIdsByPlanId,
  jurisdictionsArray,
  jurisdictionsById,
} from '../../tests/fixtures';

import { Provider } from 'react-redux';
import { REPORT_IRS_PLAN_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import {
  fetchChildrenByParentId,
  fetchJurisdictionIdsByPlanId,
  fetchJurisdictions,
} from '../../../../../../store/ducks/jurisdictions';
import {
  extractPlanRecordFromPlanPayload,
  PlanPayload,
  PlanRecord,
} from '../../../../../../store/ducks/plans';
import ConnectedIrsReport, { defaultIrsReportProps, IrsReport, IrsReportProps } from '../../report';

const history = createBrowserHistory();
jest.mock('../../../../../../configs/env');

describe('containers/pages/IrsReportList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.reset();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();

    const routeProps = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: irsPlanDefinition1.identifier },
        path: `${REPORT_IRS_PLAN_URL}/:id`,
        url: `${REPORT_IRS_PLAN_URL}/0230f9e8-1f30-5e91-8693-4c993661785e`,
      },
    };

    // check extractPlanRecordFromPlanPayload functionality
    const planById: PlanRecord | null = extractPlanRecordFromPlanPayload(
      irsPlanDefinition1 as PlanPayload
    );
    expect(planById).toEqual(irsPlanRecord1);

    const ownProps = {
      ...defaultIrsReportProps,
      planById,
      planId: irsPlanDefinition1.identifier,
    };

    shallow(
      <Router history={history}>
        <IrsReport {...routeProps} {...ownProps} />
      </Router>
    );
  });

  // it('renders the IRS Reporting Drilldown Table correctly', () => {
  //   const mock: any = jest.fn();
  //   // mock.mockImplementation(() => Promise.resolve(jurisdictionsArray));

  //   const routeProps = {
  //     history,
  //     location: mock,
  //     match: {
  //       isExact: true,
  //       params: { id: irsPlanDefinition1.identifier },
  //       path: `${REPORT_IRS_PLAN_URL}/:id`,
  //       url: `${REPORT_IRS_PLAN_URL}/0230f9e8-1f30-5e91-8693-4c993661785e`,
  //     },
  //   };

  //   const planById: PlanRecord | null = extractPlanRecordFromPlanPayload(
  //     irsPlanDefinition1 as PlanPayload
  //   );
  //   const ownProps: IrsReportProps = {
  //     ...defaultIrsReportProps,
  //     childrenByParentId: { ...childrenByParentId },
  //     jurisdictionIdsByPlanId: { ...jurisdictionIdsByPlanId },
  //     jurisdictionsById: { ...jurisdictionsById },
  //     planById,
  //     planId: irsPlanDefinition1.identifier,
  //   };

  //   store.dispatch(fetchJurisdictions(jurisdictionsArray));
  //   store.dispatch(fetchChildrenByParentId(childrenByParentId));
  //   store.dispatch(fetchJurisdictionIdsByPlanId(jurisdictionIdsByPlanId));

  //   const wrapper = mount(
  //     <Provider store={store}>
  //       <Router history={history}>
  //         <IrsReport {...routeProps} {...ownProps} />
  //       </Router>
  //     </Provider>
  //   );

  //   expect(wrapper.find('h2.page-title')).toMatchSnapshot();
  //   expect(wrapper.find('nav.reveal-breadcrumb')).toMatchSnapshot();
  //   expect(wrapper.find('.table-bread-crumbs')).toMatchSnapshot();
  //   expect(wrapper.find('.ReactTable .rt-thead.-headerGroups')).toMatchSnapshot();
  //   expect(wrapper.find('.ReactTable .rt-tbody')).toMatchSnapshot();
  // });
});
