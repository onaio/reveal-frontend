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
import { STUDENTS_TITLE } from '../../../../../configs/lang';
import { QUERY_PARAM_TITLE } from '../../../../../constants';
import store from '../../../../../store';
import reducer, {
  fetchFiles,
  reducerName,
  removeFilesAction,
} from '../../../../../store/ducks/opensrp/clientfiles';
import * as fixtures from './fixtures';
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
    store.dispatch(fetchFiles([fixtures.files[0]]));
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
    expect(wrapper.find('.tbody .tr').length).toEqual(1);
    expect(wrapper.find('.tbody .tr .td').length).toEqual(3);
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
});
