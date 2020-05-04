/** Custom and the default pagination page.  */
import { Dictionary } from '@onaio/utils/dist/types/types';
import React from 'react';
import { UsePaginationInstanceProps } from 'react-table';
import { OF, PAGE, ROWS_TO_DISPLAY } from '../constants';
import './pagination.css';

/** interface describes props for Reveal Custom Pagination */
export interface PaginationProps<T extends object> extends UsePaginationInstanceProps<T> {
  pageIndex: number;
  pageSize: number;
  pageSizeCategories: number[];
  rowsToDisplayText: string;
  pageText: string;
  ofText: string;
}

/** default props for Reveal Pagination */
const defaultPaginationProps = {
  pageSizeCategories: [1, 10, 20, 30, 50],
  rowsToDisplayMessage: ROWS_TO_DISPLAY,
  pageText: PAGE,
  ofText: OF,
};

/** Reveal pagination component */
function RevealPagination<T extends object = Dictionary>(props: PaginationProps<T>) {
  const {
    gotoPage,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    pageIndex,
    pageOptions,
    pageSize,
    setPageSize,
    pageSizeCategories,
    rowsToDisplayText,
    pageText,
    ofText,
  } = props;
  return (
    <div className="pagination">
      <span className="page-sizes-text">{rowsToDisplayText}</span>
      <select
        className="page-sizes-select"
        value={pageSize}
        onChange={e => {
          setPageSize(Number(e.target.value));
        }}
      >
        {pageSizeCategories.map(pageSize => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </select>
      <button
        style={{ marginRight: '10px' }}
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      >
        {'prev'}
      </button>
      <span>
        {PAGE} {'  '}
        <input
          type="text"
          defaultValue={pageIndex + 1}
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
          style={{ width: '40px' }}
        />{' '}
        {OF} {pageOptions.length}
      </span>
      <button style={{ marginLeft: '10px' }} onClick={() => nextPage()} disabled={!canNextPage}>
        {'next'}
      </button>{' '}
    </div>
  );
}

RevealPagination.defaultProps = defaultPaginationProps;

export { RevealPagination };

export const renderPaginationFun = <T extends object>(props: PaginationProps<T>) => {
  const revealProps = props;
  return <RevealPagination {...revealProps} />;
};
