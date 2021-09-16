import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedClientListView, { ClientListView } from '../';
import { OPENSRP_API_BASE_URL } from '../../../../../configs/env';
import { STUDENTS_TITLE } from '../../../../../configs/lang';
import { QUERY_PARAM_TITLE } from '../../../../../constants';
import store from '../../../../../store';
import reducer, {
  fetchFiles,
  reducerName,
  removeFilesAction,
} from '../../../../../store/ducks/opensrp/clientfiles';
import * as fixtures from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

reducerRegistry.register(reducerName, reducer);
const history = createBrowserHistory();
jest.mock('../../../../../configs/env');

describe('containers/pages/MDAPoints/ClientListView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(removeFilesAction);
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      fetchFilesActionCreator: jest.fn(),
      files: [fixtures.files[0]],
      history,
      location: mock,
      match: mock,
    };
    shallow(
      <Router history={history}>
        <ClientListView {...props} />
      </Router>
    );
  });

  it('renders without crashing for null files', () => {
    const mock: any = jest.fn();
    const props = {
      fetchFilesActionCreator: jest.fn(),
      files: [],
      history,
      location: mock,
      match: mock,
    };
    shallow(
      <Router history={history}>
        <ClientListView {...props} />
      </Router>
    );
  });

  it('renders ClientListView correctly $ changes page title', async () => {
    const mock: any = jest.fn();
    // mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      clientLabel: 'Students',
      fetchFilesActionCreator: jest.fn(),
      files: fixtures.files,
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ClientListView {...props} />
      </Router>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(STUDENTS_TITLE);
    expect(wrapper.find(ClientListView).props().files).toEqual(fixtures.ClientListViewprops.files);
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb').props()).toEqual({
      currentPage: {
        label: 'Students',
        url: '/clients',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    });
    wrapper.unmount();
  });

  it('renders ClientListView correctly for null files', async () => {
    const mock: any = jest.fn();
    // mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      clientLabel: 'Students',
      fetchFilesActionCreator: jest.fn(),
      files: [],
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ClientListView {...props} />
      </Router>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('DrillDownTable').props().data).toEqual([]);
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb').props()).toEqual({
      currentPage: {
        label: 'Students',
        url: '/clients',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    });
    expect(wrapper.find('NoDataComponent').length).toBeTruthy();
    expect(
      wrapper
        .find('NoDataComponent')
        .at(1)
        .text()
    ).toEqual('No Data Found');
    wrapper.unmount();
  });

  it('works with the Redux store', async () => {
    store.dispatch(fetchFiles(fixtures.files));
    const mock: any = jest.fn();
    // mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedClientListView {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot();
    expect(wrapper.find('.thead .tr').text()).toEqual('File NameOwnerUpload Date');
    expect(wrapper.find('.tbody .tr').length).toEqual(3);
    expect(wrapper.find('.tbody .tr .td').length).toEqual(9);
    // are the rows sorted from latest item to oldest by default
    expect(wrapper.find('.tbody .tr').map(row => row.text())).toEqual([
      'Gicandi_school.csv  (Download)Mowshaqs4/05/2021',
      'Barush_school.csv  (Download)Mowshaqs4/05/2020',
      'Junior_school.csv  (Download)Mowshaqs4/05/2019',
    ]);
    // click on the date column to sort (should sort from oldest to latest)
    wrapper
      .find('.thead .tr .th')
      .at(2)
      .simulate('click');
    wrapper.update();
    expect(wrapper.find('.tbody .tr').map(row => row.text())).toEqual([
      'Junior_school.csv  (Download)Mowshaqs4/05/2019',
      'Barush_school.csv  (Download)Mowshaqs4/05/2020',
      'Gicandi_school.csv  (Download)Mowshaqs4/05/2021',
    ]);
    // click on the date column to sort (should sort from latest to oldest)
    wrapper
      .find('.thead .tr .th')
      .at(2)
      .simulate('click');
    wrapper.update();
    expect(wrapper.find('.tbody .tr').map(row => row.text())).toEqual([
      'Gicandi_school.csv  (Download)Mowshaqs4/05/2021',
      'Barush_school.csv  (Download)Mowshaqs4/05/2020',
      'Junior_school.csv  (Download)Mowshaqs4/05/2019',
    ]);

    wrapper.unmount();
  });

  it('Search works correctly', async () => {
    store.dispatch(fetchFiles(fixtures.files));
    const mock = jest.fn();
    const props = {
      history,
      location: {
        hash: '',
        pathname: '',
        search: `${QUERY_PARAM_TITLE}=junior`,
        state: '',
      },
      match: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedClientListView {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('DrillDownTable').props().data?.length).toEqual(1);
    expect(wrapper.find('DrillDownTable').props().data).toEqual([fixtures.files[2]]);
    wrapper.unmount();
  });

  it('CSV download works', async () => {
    store.dispatch(fetchFiles(fixtures.files2));
    const mock: any = jest.fn();
    const props = {
      baseURL: OPENSRP_API_BASE_URL.replace('rest/', ''),
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedClientListView {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    wrapper
      .find('.btn-link')
      .at(0)
      .simulate('click');
    await act(async () => {
      await flushPromises();
    });
    expect(fetch.mock.calls[1]).toEqual([
      'https://test.smartregister.org/opensrp/multimedia/media/8bfee034-f172-4c3c-afd7-aeba3f72acd5?dynamic-media-directory=true',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer null',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ]);
  });
});
