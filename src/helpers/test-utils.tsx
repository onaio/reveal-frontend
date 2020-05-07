import { ReactWrapper } from 'enzyme';

/** a html-text-nodes only way to render a table in spashots as a series of table rows. */
export const renderTable = (wrap: ReactWrapper, text = '') => {
  wrap
    .find('table tr')
    .forEach((tr: ReactWrapper, indx: number) =>
      expect(tr.text()).toMatchSnapshot(`${text} tr index ${indx}`)
    );
};
