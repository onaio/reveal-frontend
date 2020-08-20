import { ReactWrapper } from 'enzyme';

/** will use this to render table rows use with @onaio/listview */
export const renderTable = (wrapper: ReactWrapper, message: string) => {
  const trs = wrapper.find('table tr');
  trs.forEach(tr => {
    expect(tr.text()).toMatchSnapshot(message);
  });
};
