import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import UploadConfigFilePage from '..';
import { MANIFEST_RELEASES } from '../../../../../../configs/lang';
import { MANIFEST_RELEASE_URL } from '../../../../../../constants';
import store from '../../../../../../store';

const history = createBrowserHistory();

const props = {
  history,
  location: {
    hash: '',
    pathname: MANIFEST_RELEASE_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {},
    path: `${MANIFEST_RELEASES}`,
    url: `${MANIFEST_RELEASE_URL}`,
  },
};

describe('containers/pages/ConfigForm/manifest/uploadFile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<UploadConfigFilePage {...props} />);
  });

  it('renders form upload correctly', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UploadConfigFilePage {...props} />
        </Router>
      </Provider>
    );
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Upload Form');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('Upload Form');

    expect(wrapper.find('UploadConfigFile').props()).toMatchSnapshot('upload form');

    expect(wrapper.find('input[name="form_name"]')).toBeTruthy();
    expect(wrapper.find('input[name="module"]')).toBeTruthy();
    expect(wrapper.find('input[name="form_relation"]')).toBeTruthy();
    expect(wrapper.find('input[name="form"]')).toBeTruthy();
  });

  it('renders form edit correctly', async () => {
    const editValidatorProps = {
      history,
      location: {
        hash: '',
        pathname: MANIFEST_RELEASE_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {
          id: '01',
          type: 'validator-upload',
        },
        path: `${MANIFEST_RELEASES}`,
        url: `${MANIFEST_RELEASE_URL}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UploadConfigFilePage {...editValidatorProps} />
        </Router>
      </Provider>
    );
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Edit Form');
    expect(wrapper.find('.page-title').text()).toEqual('Edit Form');

    expect(wrapper.find('UploadConfigFile').props()).toMatchSnapshot('edit form');

    expect(wrapper.find('input[name="form_name"]')).toBeTruthy();
    expect(wrapper.find('input[name="module"]')).toBeTruthy();
    expect(wrapper.find('input[name="form_relation"]')).toBeTruthy();
    expect(wrapper.find('input[name="form"]')).toBeTruthy();
    // 3 of inputs should be disabled
    expect(wrapper.find('input[disabled=true]').length).toEqual(3);
  });
});
