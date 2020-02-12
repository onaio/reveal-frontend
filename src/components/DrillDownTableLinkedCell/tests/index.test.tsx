import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { CellInfo } from 'react-table';
import DrillDownTableLinkedCell from '..';

const urlPath: string = 'http://example.com/path';
/* tslint:disable:object-literal-sort-keys */

const cell: CellInfo = {
  index: 0,
  viewIndex: 0,
  pageSize: 20,
  page: 0,
  level: 0,
  nestingPath: [0],
  column: {
    Header: '',
    show: true,
    minWidth: 90,
    className: '',
    style: {},
    headerClassName: '',
    headerStyle: {},
    footerClassName: '',
    footerStyle: {},
    filterAll: false,
    id: 'id',
  },
  value: '2019-11-20',
  resized: [],
  show: true,
  width: 90,
  tdProps: {
    rest: {},
  },
  columnProps: {
    rest: {},
  },
  classes: [],
  styles: {},
  pivoted: false,
  expander: false,
  isExpanded: false,
  maxWidth: 4,
  row: {},
  rowValues: {},
  aggregated: false,
  groupedByPivot: false,
  subRows: [],
  original: {},
};
/* tslint:disable:object-literal-sort-keys */

/**
 * Investiate why cellValue = 'some value' fails but
 * cellValue = cell.value works. Also why should either work if the component expects the value to be
 * of type Node?
 */
const cellValue = cell.value;
const history = createBrowserHistory();

describe('/components/DrillDownTableLinkedCell', () => {
  const propsHasChildren = {
    cell,
    cellValue,
    hasChildren: true,
    urlPath,
  };
  it('renders correctly if prop hasChildren is true', () => {
    const wrapper = mount(
      <Router history={history}>
        <DrillDownTableLinkedCell {...propsHasChildren} />
      </Router>
    );
    expect(wrapper.find(DrillDownTableLinkedCell).props()).toEqual(propsHasChildren);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders correctly if prop hasChildren is false', () => {
    const propsHasChildrenFalse = {
      ...propsHasChildren,
      hasChildren: false,
    };
    const wrapper = mount(
      <Router history={history}>
        <DrillDownTableLinkedCell {...propsHasChildrenFalse} />
      </Router>
    );
    expect(wrapper.find(DrillDownTableLinkedCell).props()).toEqual(propsHasChildrenFalse);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
