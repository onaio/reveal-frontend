import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { Router } from 'react-router';
import ClientUpload from '..';
const history = createBrowserHistory();

describe('components/LinkToNewPlans', () => {
  afterEach(cleanup);
  it('renders without crashing', () => {
    shallow(<ClientUpload />);
  });

  it('Matches snapshot', () => {
    const wrapper = mount(
      <Router history={history}>
        <ClientUpload />
      </Router>
    );
    expect(toJson(wrapper.find('ClientUpload'))).toMatchSnapshot();
    wrapper.unmount();
  });

  //   it('can select an image and upload will make a request to upload it', () => {
  //     const { container, getByLabelText, getByText, getByAltText } = render(
  //       <Router history={history}>
  //         <ClientUpload />
  //       </Router>
  //     );
  //     const file = new File(['(⌐□_□)'], 'student.csv', { type: 'text/csv' });
  //     const fileInput = container.querySelector('input[name="file"]');
  //     // if (fileInput) {
  //     //   Simulate.change(fileInput, { target: { files: [file] } });
  //     // }
  //     // Object.defineProperty(fileInput, 'files', {
  //     //   value: [file],
  //     // });
  //     fireEvent.change(fileInput);
  //     getByText('student.csv');
  //   });
});
