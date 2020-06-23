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
import { columns } from './utils';

/** propTypes for presentation component */
export interface OpenSRPPlansListProps {
  loadData?: (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => void;
  plansArray: PlanRecord[];
  tableColumns: Array<DrillDownColumn<PlanRecord>>;
  pageTitle: string;
  pageUrl: string;
  newPlanRoute: string;
}

/** defaultIrsPlansProps - default props for IRS Plans page */
export const defaultProps: OpenSRPPlansListProps = {
  newPlanRoute: `${PLANNING_VIEW_URL}/${NEW}`,
  pageTitle: DRAFT_PLANS,
  pageUrl: PLANNING_VIEW_URL,
  plansArray: [],
  tableColumns: columns,
};

/** IrsPlans presentation component */
const OpenSRPPlansList = (props: OpenSRPPlansListProps & RouteComponentProps) => {
  const [loading, setLoading] = React.useState<boolean>(props.plansArray.length === 0);
  React.useEffect(() => {
    if (!props.loadData) {
      setLoading(false);
    } else {
      props.loadData(setLoading);
    }
  }, []);

  const { pageTitle, pageUrl } = props;
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

  const { plansArray } = props;

  /** tableProps - props for DrillDownTable component */
  const tableProps: Pick<
    DrillDownTableProps<PlanRecord>,
    | 'columns'
    | 'data'
    | 'loading'
    | 'loadingComponent'
    | 'renderInBottomFilterBar'
    | 'renderInTopFilterBar'
    | 'useDrillDown'
    | 'renderNullDataComponent'
  > = {
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
      <Button className="create-plan" color="primary" tag={Link} to={props.newPlanRoute}>
        {CREATE_NEW_PLAN}
      </Button>
    </div>
  );
};

OpenSRPPlansList.defaultProps = defaultProps;

export { OpenSRPPlansList };
