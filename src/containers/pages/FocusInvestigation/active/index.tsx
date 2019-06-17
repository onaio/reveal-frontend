// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import 'react-table/react-table.css';
import { Table } from 'reactstrap';
import { Store } from 'redux';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { FIClassifications, locationHierarchy } from '../../../../configs/settings';
import {
  ACTIVE_FOCUS_INVESTIGATION,
  CASE_CLASSIFICATION_HEADER,
  CASE_NOTIF_DATE_HEADER,
  DEFINITIONS,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FOCUS_AREA_HEADER,
  REASON_HEADER,
  STATUS_HEADER,
} from '../../../../constants';
import { renderClassificationRow } from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import {
  extractPlan,
  getLocationColumns,
  RouteParams,
  transformValues,
} from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlans,
  getPlansArray,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** interface to describe props for ActiveFI component */
export interface ActiveFIProps {
  fetchPlansActionCreator: typeof fetchPlans;
  plansArray: Plan[];
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI component */
export const defaultActiveFIProps: ActiveFIProps = {
  fetchPlansActionCreator: fetchPlans,
  plansArray: [],
  supersetService: supersetFetch,
};

/** Reporting for Active Focus Investigations */
class ActiveFocusInvestigation extends React.Component<
  ActiveFIProps & RouteComponentProps<RouteParams>,
  {}
> {
  public static defaultProps: ActiveFIProps = defaultActiveFIProps;
  constructor(props: ActiveFIProps & RouteComponentProps<RouteParams>) {
    super(props);
  }

  public componentDidMount() {
    const { fetchPlansActionCreator, supersetService } = this.props;
    supersetService(SUPERSET_PLANS_SLICE).then((result: Plan[]) => fetchPlansActionCreator(result));
  }

  public render() {
    const { plansArray } = this.props;
    if (plansArray.length === 0) {
      return <Loading />;
    }
    const thePlans = plansArray.map((item: Plan) => {
      let thisItem = extractPlan(item);
      // transform values of this properties if they are null
      const propertiesToTransform = [
        'village',
        'canton',
        'district',
        'provice',
        'jurisdiction_id',
        'focusArea',
      ];
      thisItem = transformValues(thisItem, propertiesToTransform);
      return thisItem;
    });
    const locationColumns: Column[] = getLocationColumns(locationHierarchy, true);
    const otherColumns: Column[] = [
      {
        Header: FOCUS_AREA_HEADER,
        columns: [
          {
            Cell: (cell: CellInfo) => {
              return (
                <div>
                  {cell.original.focusArea.trim() && (
                    <Link to={`${FI_SINGLE_MAP_URL}/${cell.original.id}`}>
                      <FontAwesomeIcon icon={['fas', 'map']} />
                    </Link>
                  )}
                  &nbsp;&nbsp;
                  {cell.original.focusArea.trim() && (
                    <Link to={`${FI_SINGLE_URL}/${cell.original.id}`}>{cell.value}</Link>
                  )}
                </div>
              );
            },
            Header: '',
            accessor: 'focusArea',
            minWidth: 130,
          },
        ],
      },
      {
        Header: REASON_HEADER,
        columns: [
          {
            Header: '',
            accessor: 'reason',
            minWidth: 100,
          },
        ],
      },
      {
        Header: STATUS_HEADER,
        columns: [
          {
            Header: '',
            accessor: 'status',
            maxWidth: 60,
          },
        ],
      },
      {
        Header: CASE_NOTIF_DATE_HEADER,
        columns: [
          {
            Cell: (cell: CellInfo) => {
              return <div>{cell.value}</div>;
            },
            Header: '',
            accessor: 'caseNotificationDate',
            minWidth: 120,
          },
        ],
      },
      {
        Header: CASE_CLASSIFICATION_HEADER,
        columns: [
          {
            Header: '',
            accessor: 'caseClassification',
          },
        ],
      },
    ];
    const allColumns: Column[] = locationColumns.concat(otherColumns);

    const tableProps = {
      CellComponent: DrillDownTableLinkedCell,
      columns: allColumns,
      data: thePlans,
      identifierField: 'id',
      linkerField: 'id',
      minRows: 0,
      parentIdentifierField: 'parent',
      rootParentId: null,
      showPageSizeOptions: false,
      showPagination: false,
      useDrillDownTrProps: false,
    };

    return (
      <div>
        <h3 className="mb-3 mt-5 page-title">{ACTIVE_FOCUS_INVESTIGATION}</h3>
        <DrillDownTable {...tableProps} />
        <h5 className="mt-5">{DEFINITIONS}</h5>
        <Table className="definitions">
          <tbody>{FIClassifications.map(el => renderClassificationRow(el))}</tbody>
        </Table>
      </div>
    );
  }
}

export { ActiveFocusInvestigation };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plansArray: Plan[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
  const result = {
    plansArray: getPlansArray(state),
  };
  return result;
};

const mapDispatchToProps = { fetchPlansActionCreator: fetchPlans };

/** create connected component */

/** Connected ActiveFI component */
const ConnectedActiveFocusInvestigation = connect(
  mapStateToProps,
  mapDispatchToProps
)(ActiveFocusInvestigation);

export default ConnectedActiveFocusInvestigation;
