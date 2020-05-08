/** The default custom pagination component for drillDown v7  */
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { OF, PAGE, ROWS_TO_DISPLAY } from '../../../../../configs/lang';
import { RenderPaginationOptions } from '../../components/TableJSX';
import './pagination.css';

/** interface describes props for Reveal Custom Pagination */
export interface PaginationProps<T extends object> extends RenderPaginationOptions<T> {
  pageSizeCategories: number[] /** an array of page size options */;
}

/** default props for Reveal Pagination */
const defaultPaginationProps = {
  pageSizeCategories: [10, 20, 30, 50],
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
  } = props;
  return (
    <div className="pagination">
      <span className="page-sizes-text mr-2">{ROWS_TO_DISPLAY}</span>
      <select
        className="page-sizes-select mr-4"
        value={pageSize}
        // tslint:disable-next-line: jsx-no-lambda
        onChange={e => {
          setPageSize(Number(e.target.value));
        }}
      >
        {pageSizeCategories.map(pgSize => (
          <option key={pgSize} value={pgSize}>
            {pgSize}
          </option>
        ))}
      </select>
      <button
        className="mr-2"
        // tslint:disable-next-line: jsx-no-lambda
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      >
        {'prev'}
      </button>
      <span>
        {PAGE} {'  '}
        <input
          type="text"
          value={pageIndex + 1}
          // tslint:disable-next-line: jsx-no-lambda
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
          style={{ width: '40px' }}
        />{' '}
        {OF} {pageOptions.length}
      </span>
      {/* tslint:disable-next-line:jsx-no-lambda */}
      <button className="ml-2" onClick={() => nextPage()} disabled={!canNextPage}>
        {'next'}
      </button>{' '}
    </div>
  );
}

RevealPagination.defaultProps = defaultPaginationProps;

export { RevealPagination };

/** function that can be used as a render prop */
export const renderPaginationFun = <T extends object>(props: PaginationProps<T>) => {
  const revealProps = props;
  return <RevealPagination {...revealProps} />;
};
