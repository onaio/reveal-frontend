import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Column } from 'react-table';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import { NO_INVESTIGATIONS_FOUND } from '../../../../configs/lang';
import { extractPlan, removeNullJurisdictionPlans } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import { Plan } from '../../../../store/ducks/plans';

/** construct props for DrillDown for activeFI page
 * Generic type D is the type of data that will be passed to the Table
 * its not `Plan` because the plan goes through a few transformations before being rendered,
 * at render its structure will have mutated to a Dictionary courtesy of 'extractPlan'
 * @param columns - react-table compatible columns
 * @param data - array of data to be rendered in table
 * @param queryParam - the key to be used by searchForm to use as key in searchParam
 */
export const createTableProps = <D extends object, TProps extends RouteComponentProps>(
  columns: Array<Column<D>>,
  data: Plan[] | null,
  props: TProps,
  paramString: string,
  service: typeof OpenSRPService,
  noDataMessage: string = NO_INVESTIGATIONS_FOUND
) => {
  const cleanedData = data !== null ? data : [];
  const jurisdictionValidPlans = removeNullJurisdictionPlans(cleanedData);
  const thePlans = jurisdictionValidPlans.map(extractPlan);

  return {
    CellComponent: DrillDownTableLinkedCell,
    columns,
    data: thePlans,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      componentProps: props,
      queryParam: paramString,
      serviceClass: service,
    }),
    renderNullDataComponent: () => <NoDataComponent message={noDataMessage} />,
    useDrillDown: false,
  };
};
