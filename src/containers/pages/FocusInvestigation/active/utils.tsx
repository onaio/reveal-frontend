import React from 'react';
import { Column } from 'react-table';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import { RowHeightFilter } from '../../../../components/forms/FilterForm/RowHeightFilter';
import { SearchForm } from '../../../../components/forms/Search';
import { RenderFiltersInBarOptions } from '../../../../components/Table/DrillDown';
import { SEARCH } from '../../../../configs/lang';
import { extractPlan, removeNullJurisdictionPlans } from '../../../../helpers/utils';
import { Plan } from '../../../../store/ducks/plans';

/** construct props for DrillDownv7 for activeFI page
 * Generic type D is the type of data that will be passed to the Table
 * its not Plan becuase the Plan goes through a few transformations before being rendered,
 * at render its structure will have mutated to a Dictionary courtesy of 'extractPlan'
 * @param columns - react-table compatible columns
 * @param data - array of data to be rendered in table
 * @param queryParam - the key to be used by searchForm to use as key in searchParam
 */
export const createTableProps = <D extends object>(
  columns: Array<Column<D>>,
  data: Plan[] | null,
  queryParam: string
) => {
  const cleanedData = data !== null ? data : [];
  const jurisdictionValidPlans = removeNullJurisdictionPlans(cleanedData);
  const thePlans = jurisdictionValidPlans.map(extractPlan);

  return {
    CellComponent: DrillDownTableLinkedCell,
    columns,
    data: thePlans,
    renderInFilterBar: (options: RenderFiltersInBarOptions) => {
      const changeHandler = (value: string) => options.setRowHeight(value);
      return (
        <>
          <SearchForm placeholder={SEARCH} queryParam={queryParam} />
          <RowHeightFilter changeHandler={changeHandler} />
        </>
      );
    },
    useDrillDown: false,
  };
};
