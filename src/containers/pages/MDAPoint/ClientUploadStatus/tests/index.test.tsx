import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import React from 'react';
import UploadStatus from '..';

describe('components/ClientUploadStatus', () => {
  const file = new File(['student'], 'student.csv', {
    type: 'text/csv',
  });
  it('renders without crashing', () => {
    shallow(<UploadStatus />);
  });

  it('Matches snapshot', async () => {
    const props = {
      uploadFile: file,
    };
    const wrapper = mount(<UploadStatus {...props} />);
    await flushPromises();
    wrapper.update();
    expect(toJson(wrapper.find('UploadStatus'))).toMatchSnapshot();
    wrapper.unmount();
  });
  it('Calls filereader', async () => {
    const props = {
      uploadFile: file,
    };
    const readAsDataURLSpy = jest.spyOn(FileReader.prototype, 'readAsDataURL');
    const wrapper = mount(<UploadStatus {...props} />);
    await flushPromises();
    wrapper.update();
    expect(readAsDataURLSpy).toBeCalledTimes(1);
  });
});
