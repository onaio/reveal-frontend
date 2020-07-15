import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedClientListView, { ClientListView } from '../';
import { STUDENTS_TITLE } from '../../../../../configs/lang';
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
      files: null,
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

  it('renders ClientListView correctly $ changes page title', () => {
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
      files: null,
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ClientListView {...props} />
      </Router>
    );
    await flushPromises();
    wrapper.update();

    expect(wrapper.find(ClientListView).props().files).toEqual(null);
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.listview-thead').length).toEqual(1);
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
    expect(wrapper.find('#table-row .col div').text()).toEqual('No Data Found');
    wrapper.unmount();
  });

  it('works with the Redux store', () => {
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
    wrapper.update();
    expect(
      wrapper
        .find('.table')
        .at(0)
        .props()
    ).toMatchSnapshot();
    expect(
      wrapper
        .find('.listview-thead')
        .at(0)
        .props()
    ).toMatchSnapshot();
    expect(
      wrapper
        .find('.listview-tbody')
        .at(0)
        .props()
    ).toMatchSnapshot();
    wrapper.unmount();
  });
});
