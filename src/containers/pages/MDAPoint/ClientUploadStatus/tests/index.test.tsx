import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import UploadStatus from '..';

describe('components/ClientUploadStatus', () => {
  it('renders without crashing', () => {
    shallow(<UploadStatus />);
  });

  it('Matches snapshot', () => {
    const wrapper = mount(<UploadStatus />);
    expect(toJson(wrapper.find('UploadStatus'))).toMatchSnapshot();
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
