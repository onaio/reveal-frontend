/** presentational component that renders a list of plan definitions( plans fetched from the opensrp api ) */
import { DrillDownColumn, DrillDownTable, DrillDownTableProps } from '@onaio/drill-down-table';
import React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import { CREATE_NEW_PLAN, DRAFT_PLANS, HOME } from '../../../../configs/lang';
import { HOME_URL, NEW, PLANNING_VIEW_URL, QUERY_PARAM_TITLE } from '../../../../constants';
import { PlanRecord } from '../../../../store/ducks/plans';
import { draftPageColumns } from './utils';

/** propTypes for presentation component */
export interface OpenSRPPlansListProps {
  loadData?: (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => void;
  plansArray: PlanRecord[];
  tableColumns: Array<DrillDownColumn<PlanRecord>>;
  pageTitle: string;
  pageUrl: string;
  newPlanUrl: string;
}

/** default Props for the presentational component */
export const defaultProps: OpenSRPPlansListProps = {
  newPlanUrl: `${PLANNING_VIEW_URL}/${NEW}`,
  pageTitle: DRAFT_PLANS,
  pageUrl: PLANNING_VIEW_URL,
  plansArray: [],
  tableColumns: draftPageColumns,
};

/** table prop type */
type TableProps = Pick<
  DrillDownTableProps<PlanRecord>,
  | 'columns'
  | 'data'
  | 'loading'
  | 'loadingComponent'
  | 'renderInBottomFilterBar'
  | 'renderInTopFilterBar'
  | 'useDrillDown'
  | 'renderNullDataComponent'
>;

/** TODO - investigate an appropriate strategy of making a presentational view like this configurable
 * - maybe keep the rendered components and hoist all their props to the component's props level.
 */

/** presentational view component that renders opensrp plans */
const OpenSRPPlansList = (props: OpenSRPPlansListProps & RouteComponentProps) => {
  const [loading, setLoading] = React.useState<boolean>(props.plansArray.length === 0);

  React.useEffect(() => {
    if (!props.loadData) {
      setLoading(false);
    } else {
      props.loadData(setLoading);
    }
  }, []);

  const { pageTitle, pageUrl, plansArray } = props;
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: pageTitle,
      url: pageUrl,
    },
    pages: [homePage],
  };

  /** tableProps - props for DrillDownTable component */
  const tableProps: TableProps = {
    columns: props.tableColumns,
    data: plansArray,
    loading,
    loadingComponent: Loading,
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
      queryParam: QUERY_PARAM_TITLE,
      showFilters: false,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
    useDrillDown: false,
  };

  return (
    <div className="mb-5">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumbs {...breadCrumbProps} />
      <h2 className="page-title">{pageTitle}</h2>
      <DrillDownTable {...tableProps} />
      <br />
      <Button className="create-plan" color="primary" tag={Link} to={props.newPlanUrl}>
        {CREATE_NEW_PLAN}
      </Button>
    </div>
  );
};

OpenSRPPlansList.defaultProps = defaultProps;

export { OpenSRPPlansList };
