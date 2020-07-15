import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import { AssignmentMapWrapper } from '..';
import * as jurisdictionDucks from '../../../../store/ducks/opensrp/jurisdictions';
import * as fixtures from './fixtures';
import { FeatureCollection } from '@turf/turf';

jest.mock('../../../../components/GisidaLite', () => {
  const GisidaLiteMock = () => <div>I love oov</div>;
  return {
    GisidaLite: GisidaLiteMock,
  };
});
jest.mock('../../../../configs/env');
const history = createBrowserHistory();

describe('containers/pages/AssigmentMapWrapper', () => {
  it('renders successfully', () => {
    shallow(
      <Router history={history}>
        <AssignmentMapWrapper />
      </Router>
    );
  });
  it('renders jurisdictions assignment map', () => {
    const props = {
      currentParentId: '07b09ec1-0589-4a98-9480-4c403ac24d59',
      rootJurisdictionId: '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
      getJurisdictionsFeatures: fixtures.geoCollection as FeatureCollection,
    };
    const wrapper = mount(
      <Router history={history}>
        <AssignmentMapWrapper {...props} />
      </Router>
    );
    expect(toJson(wrapper.find('.map'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
