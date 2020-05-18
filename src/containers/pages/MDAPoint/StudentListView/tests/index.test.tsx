import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedStudentListView, { StudentListView } from '../';
import { STUDENTS_TITLE } from '../../../../../configs/lang';
import store from '../../../../../store';
import reducer, {
  fetchFiles,
  reducerName,
  removeFilesAction,
} from '../../../../../store/ducks/opensrp/files';
import * as fixtures from './fixtures';
reducerRegistry.register(reducerName, reducer);
const history = createBrowserHistory();
jest.mock('../../../../../configs/env');

describe('containers/pages/MDAPoints/StudentListView', () => {
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
        <StudentListView {...props} />
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
        <StudentListView {...props} />
      </Router>
    );
  });

  it('renders StudentListView correctly $ changes page title', () => {
    const mock: any = jest.fn();
    // mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      fetchFilesActionCreator: jest.fn(),
      files: fixtures.files,
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <StudentListView {...props} />
      </Router>
    );
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(STUDENTS_TITLE);
    expect(wrapper.find(StudentListView).props().files).toEqual(
      fixtures.studentListViewprops.files
    );
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb').props()).toEqual({
      currentPage: {
        label: 'Students',
        url: '/students',
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

  it('renders StudentListView correctly for null files', () => {
    const mock: any = jest.fn();
    // mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      fetchFilesActionCreator: jest.fn(),
      files: null,
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <StudentListView {...props} />
      </Router>
    );
    expect(wrapper.find(StudentListView).props().files).toEqual(null);
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb').props()).toEqual({
      currentPage: {
        label: 'Students',
        url: '/students',
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
          <ConnectedStudentListView {...props} />
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
