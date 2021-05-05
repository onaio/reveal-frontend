import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedMDALiteMapReport from '..';
import { REPORT_MDA_LITE_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  reducerName as genericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import GenericPlansReducer, {
  reducerName as genericPlanReducerName,
} from '../../../../../store/ducks/generic/plans';
import genericStructuresReducer, {
  reducerName as genericStructuresReducerName,
} from '../../../../../store/ducks/generic/structures';
import {
  MDALitePlans,
  MDALiteWardGeojsonData,
  MDALteJurisidtionsData,
} from '../../../../../store/ducks/superset/MDALite/tests/fixtures';

/** register the reducers */
reducerRegistry.register(genericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericPlanReducerName, GenericPlansReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

jest.mock('../../../../../configs/env');

jest.mock('../../../../../components/GisidaLite', () => {
  const MemoizedGisidaLiteMock = () => <div>Mock component</div>;
  return {
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});

const history = createBrowserHistory();

const mock: any = jest.fn();
const planId = MDALiteWardGeojsonData[0].plan_id;
const jurisdictionId = MDALiteWardGeojsonData[0].jurisdiction_id;
const props = {
  history,
  location: mock,
  match: {
    isExact: true,
    params: {
      jurisdictionId,
      planId,
    },
    path: `${REPORT_MDA_LITE_PLAN_URL}/:planId/:jurisdictionId/map`,
    url: `${REPORT_MDA_LITE_PLAN_URL}/${planId}/${jurisdictionId}/map`,
  },
};

describe('components/MDA/Lite/Reports/wards', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('renders correctly', async () => {
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => MDALiteWardGeojsonData);
    supersetServiceMock.mockImplementationOnce(async () => MDALitePlans);
    supersetServiceMock.mockImplementationOnce(async () => MDALteJurisidtionsData);
    supersetServiceMock.mockImplementationOnce(async () => []);
    const allProps = {
      ...props,
      service: supersetServiceMock,
      subcountyData: [MDALteJurisidtionsData[1]],
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDALiteMapReport {...allProps} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('.mapSidebar h5').text()).toEqual('vihiga');
    // snapshot for map legends
    expect(toJson(wrapper.find('.mapSidebar .mapLegend'))).toMatchSnapshot();
    expect(
      wrapper
        .find('.indicator-breakdown')
        .first()
        .text()
    ).toEqual('Progress: 222 of 222 people (100%)');
    expect(
      wrapper
        .find('.indicator-breakdown')
        .last()
        .text()
    ).toEqual('Progress:  3 tablet(s)');

    wrapper.unmount();
  });
});
