import reducerRegistry from '@onaio/redux-reducer-registry';
import { shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../constants';
import plansReducer, { reducerName as plansReducerName } from '../../../../../store/ducks/plans';
import { defaultActiveFIProps, FIJurisdiction } from '../index';

jest.mock('../../../../../configs/env');

/** register the jurisdictions reducer */
reducerRegistry.register(plansReducerName, plansReducer);

const history = createBrowserHistory();

const jurisdictionID = '450fc15b-5bd2-468a-927a-49cb10d3bcac';

describe('containers/FocusInvestigation/Jurisdiction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();

    const props = {
      ...defaultActiveFIProps,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { jurisdictionId: jurisdictionID },
        path: `${FI_SINGLE_URL}/:jurisdictionId`,
        url: `${FI_SINGLE_URL}/${jurisdictionID}`,
      },
    };
    shallow(
      <MemoryRouter>
        <FIJurisdiction {...props} />
      </MemoryRouter>
    );
  });
});
