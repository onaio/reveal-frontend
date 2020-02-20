import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import 'react-table/react-table.css';
import { Col, Row, Table } from 'reactstrap';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import LinkAsButton from '../../../../components/LinkAsButton';
import NewRecordBadge from '../../../../components/NewRecordBadge';
import Loading from '../../../../components/page/Loading';
import NullDataTable from '../../../../components/Table/NullDataTable';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import {
  ADD_FOCUS_INVESTIGATION,
  CASE_CLASSIFICATION_HEADER,
  CASE_NOTIF_DATE_HEADER,
  DEFINITIONS,
  END_DATE,
  FI_STATUS,
  FOCUS_AREA_HEADER,
  NAME,
  NEXT,
  PREVIOUS,
  REACTIVE,
  ROUTINE_TITLE,
  START_DATE,
  STATUS_HEADER,
} from '../../../../configs/lang';
import {
  FIClassifications,
  FIReasons,
  locationHierarchy,
  planStatusDisplay,
} from '../../../../configs/settings';
import { FI_SINGLE_MAP_URL, FI_SINGLE_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { renderClassificationRow } from '../../../../helpers/indicators';
import {
  defaultTableProps,
  extractPlan,
  FlexObject,
  getLocationColumns,
  transformValues,
} from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlans,
  FetchPlansAction,
  InterventionType,
  makePlansArraySelector,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import reducer, { Message, reducerName, sendMessage } from '../../../../store/tests/ducks/messages';
import JurisdictionList from './JurisdictionList';

reducerRegistry.register(reducerName, reducer);
reducerRegistry.register(plansReducerName, plansReducer);

/** Interface for props that come from the URL */
export interface RouteParams {
  jurisdictionId: string;
}

/** Interface for FIJurisdiction component props */
export interface FIJurisdictionProps {
  caseTriggeredPlans: Plan[] | null;
  fetchPlansActionCreator: typeof fetchPlans;
  loadMessages: typeof sendMessage;
  messages: Message[];
  routinePlans: Plan[] | null;
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI component */
export const defaultActiveFIProps: FIJurisdictionProps = {
  caseTriggeredPlans: null,
  fetchPlansActionCreator: fetchPlans,
  loadMessages: sendMessage,
  messages: [] as Message[],
  routinePlans: null,
  supersetService: supersetFetch,
};

/** This component is meant to display a list of focus investigations for a
 * given jurisdiction.  It is meant to display for the focus area i.e. the
 * lowest level jurisdiction
 */
const FIJurisdiction = (props: FIJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const [loading, setLoading] = useState(true);

  const { caseTriggeredPlans, fetchPlansActionCreator, routinePlans, supersetService } = props;

  const jurisdictionId =
    '59ad4fa0-1945-4b50-a6e3-a056a7cdceb2' || props.match.params.jurisdictionId;

  // this gets FI plans for the current jurisdiction
  const supersetParams = superset.getFormData(2000, [
    { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
    { comparator: InterventionType.FI, operator: '==', subject: 'plan_intervention_type' },
  ]);

  useEffect(() => {
    supersetService(SUPERSET_PLANS_SLICE, supersetParams)
      .then((result: Plan[]) => {
        if (result) {
          fetchPlansActionCreator(result);
        } else {
          displayError(new Error('An error occurred'));
        }
      })
      .finally(() => setLoading(false))
      .catch(err => displayError(err));
  }, []);

  if (loading === true) {
    return <Loading />;
  }

  /** UNKNOWN */
  const pageTitle = 'pageTitle';
  const routineReactivePlans: FlexObject[] = [];
  /** END */

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <div>Breadcrumbs</div>
      <h2 className="mb-3 mt-5 page-title">{pageTitle}</h2>
      <hr />
      {[caseTriggeredPlans, routinePlans].forEach((plansArray: Plan[] | null, i) => {
        const locationColumns: Column[] = getLocationColumns(locationHierarchy, true);
        if (plansArray && plansArray.length) {
          const thePlans = plansArray.map((item: Plan) => {
            let thisItem = extractPlan(item);
            // transform values of this properties if they are null
            const propertiesToTransform = ['village', 'canton', 'district', 'province'];
            thisItem = transformValues(thisItem, propertiesToTransform);
            return thisItem;
          });
          /**  Handle Columns Unique for Routine and Reactive Tables */
          const columnsBasedOnReason = [];
          plansArray.every((singlePlan: Plan) => singlePlan.plan_fi_reason === FIReasons[1])
            ? columnsBasedOnReason.push(
                {
                  Header: CASE_NOTIF_DATE_HEADER,
                  columns: [
                    {
                      Cell: (cell: CellInfo) => {
                        return <div>{cell.value}</div>;
                      },
                      Header: '',
                      accessor: 'caseNotificationDate',
                      minWidth: 90,
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
                }
              )
            : columnsBasedOnReason.push(
                {
                  Header: START_DATE,
                  columns: [
                    {
                      Cell: (cell: CellInfo) => {
                        return <div>{cell.value}</div>;
                      },
                      Header: '',
                      accessor: 'plan_effective_period_start',
                      minWidth: 80,
                    },
                  ],
                },
                {
                  Header: END_DATE,
                  columns: [
                    {
                      Header: '',
                      accessor: 'plan_effective_period_end',
                    },
                  ],
                }
              );
          const allColumns: Column[] = [
            {
              Header: NAME,
              columns: [
                {
                  Cell: (cell: CellInfo) => {
                    return (
                      <div>
                        {cell.original.focusArea.trim() && (
                          <Link to={`${FI_SINGLE_MAP_URL}/${cell.original.id}`}>{cell.value}</Link>
                        )}
                        &nbsp;
                        <NewRecordBadge recordDate={cell.original.plan_date} />
                      </div>
                    );
                  },
                  Header: '',
                  accessor: 'plan_title',
                  minWidth: 180,
                },
              ],
            },
            {
              Header: FI_STATUS,
              columns: [
                {
                  Header: '',
                  accessor: (d: Plan) => planStatusDisplay[d.plan_status] || d.plan_status,
                  id: 'plan_status',
                  minWidth: 80,
                },
              ],
            },
            ...locationColumns,
            {
              Header: FOCUS_AREA_HEADER,
              columns: [
                {
                  Cell: (cell: CellInfo) => {
                    return (
                      <div>
                        {cell.original.focusArea.trim() && cell.value}
                        &nbsp;&nbsp;
                        {cell.original.focusArea.trim() && (
                          <Link to={`${FI_SINGLE_URL}/${cell.original.id}`}>
                            <FontAwesomeIcon icon={['fas', 'external-link-square-alt']} />
                          </Link>
                        )}
                      </div>
                    );
                  },
                  Header: '',
                  accessor: 'focusArea',
                  minWidth: 180,
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
            ...columnsBasedOnReason,
          ];
          const tableProps = {
            CellComponent: DrillDownTableLinkedCell,
            columns: allColumns,
            data: thePlans,
            identifierField: 'id',
            linkerField: 'id',
            minRows: 0,
            nextText: NEXT,
            parentIdentifierField: 'parent',
            previousText: PREVIOUS,
            rootParentId: null,
            showPageSizeOptions: false,
            showPagination: thePlans.length > 20,
            useDrillDownTrProps: false,
          };
          const TableHeaderWithOptionalForm = plansArray.every(
            d => d.plan_fi_reason === FIReasons[1]
          ) ? (
            <h3 className="mb-3 mt-5 page-title">{REACTIVE}</h3>
          ) : (
            <div className="routine-heading">
              <Row>
                <Col xs="6">
                  <h3 className="mb-3 mt-5 page-title">{ROUTINE_TITLE}</h3>
                </Col>
                <Col xs="6">
                  <LinkAsButton text={ADD_FOCUS_INVESTIGATION} />
                </Col>
              </Row>
            </div>
          );
          routineReactivePlans.push(
            <div key={thePlans[0].id}>
              {TableHeaderWithOptionalForm}
              <DrillDownTable {...tableProps} />
            </div>
          );
        } else {
          const header = i ? ROUTINE_TITLE : REACTIVE;
          const emptyPlansColumns = [
            {
              Header: NAME,
              columns: [{ minWidth: 180 }],
            },
            ...locationColumns,
            {
              Header: FOCUS_AREA_HEADER,
              columns: [{ minWidth: 180 }],
            },
            {
              Header: STATUS_HEADER,
              columns: [{ maxWidth: 60 }],
            },

            {
              Header: CASE_NOTIF_DATE_HEADER,
              columns: [{ maxWidth: 90 }],
            },
            {
              Header: CASE_CLASSIFICATION_HEADER,
              columns: [{}],
            },
          ];
          const tableProps = {
            ...defaultTableProps,
            columns: emptyPlansColumns,
          };
          routineReactivePlans.push(
            <NullDataTable tableProps={tableProps} reasonType={header} key={`${'current'}`} />
          );
        }
      })}
      {routineReactivePlans}
      <h5 className="mt-5">{DEFINITIONS}</h5>
      <Table className="definitions">
        <tbody>{FIClassifications.map(el => renderClassificationRow(el))}</tbody>
      </Table>
    </div>
  );
};

FIJurisdiction.defaultProps = defaultActiveFIProps;

const getPlansArray = makePlansArraySelector();

/** ObjectList options */
const objectListOptions = {
  actionCreator: fetchPlans,
  dispatchPropName: 'fetchPlansActionCreator',
  listPropName: 'routinePlans',
  selector: getPlansArray,
};

const ConnectedFIJurisdiction = new JurisdictionList<
  Plan,
  FetchPlansAction,
  typeof getPlansArray,
  FIJurisdictionProps & RouteComponentProps<RouteParams>
>(FIJurisdiction, objectListOptions);

/** This represents a fully redux-connected component that fetches data from
 * an API.
 */
export default ConnectedFIJurisdiction.render();
