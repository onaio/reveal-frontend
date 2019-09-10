import { shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import MockDate from 'mockdate';
import React from 'react';
import { Router } from 'react-router';
import { irsPlanDefinition1 } from '../../tests/fixtures';

import { REPORT_IRS_PLAN_URL } from '../../../../../../constants';
import {
  extractPlanRecordFromPlanPayload,
  PlanPayload,
  PlanRecord,
} from '../../../../../../store/ducks/plans';
import { defaultIrsReportProps, IrsReport } from '../../report';

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

    const planById: PlanRecord | null = extractPlanRecordFromPlanPayload(
      irsPlanDefinition1 as PlanPayload
    );
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
});
