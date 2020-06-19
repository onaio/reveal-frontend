import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { Cell } from 'react-table';
import DrillDownTableLinkedCell from '..';

const urlPath: string = '/path';
/* tslint:disable:object-literal-sort-keys */

const cell: Cell = {
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
  const props = {
    cell,
    cellValue,
    hasChildren: true,
    urlPath,
  };
  const wrapper = mount(
    <Router history={history}>
      <DrillDownTableLinkedCell {...props} />
    </Router>
  );

  it('receives props correctly', () => {
    expect(wrapper.find(DrillDownTableLinkedCell).props()).toEqual(props);
  });

  it('renders correctly if prop hasChildren is true', () => {
    expect(wrapper.find(DrillDownTableLinkedCell).html()).toEqual(
      '<div><a href="/path/2019-11-20">2019-11-20</a></div>'
    );
    wrapper.unmount();
  });

  it('renders correctly if prop hasChildren is false', () => {
    const propsHasChildrenFalse = {
      ...props,
      hasChildren: false,
    };
    const wrapperHasChildrenFalse = mount(
      <Router history={history}>
        <DrillDownTableLinkedCell {...propsHasChildrenFalse} />
      </Router>
    );

    expect(wrapperHasChildrenFalse.find(DrillDownTableLinkedCell).html()).toEqual(
      '<div>2019-11-20</div>'
    );
    wrapperHasChildrenFalse.unmount();
  });
});
