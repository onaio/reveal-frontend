import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Column } from 'react-table';
import 'react-table/react-table.css';
import Loading from '../../../../components/page/Loading';
import NullDataTable from '../../../../components/Table/NullDataTable';
import TableHeader from '../../../../components/Table/TableHeaders';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import {
  COMPLETE_FOCUS_INVESTIGATION,
  CURRENT_FOCUS_INVESTIGATION,
} from '../../../../configs/lang';
import {
  completeReactivePlansColumn,
  completeRoutinePlansColumn,
  currentReactivePlansColumns,
  currentRoutinePlansColumn,
  dateCompletedColumn,
  emptyCompleteReactivePlans,
  emptyCompleteRoutinePlans,
  emptyCurrentReactivePlans,
  emptyCurrentRoutinePlans,
  FIReasons,
  locationHierarchy,
  statusColumn,
} from '../../../../configs/settings';
import { displayError } from '../../../../helpers/errors';
import {
  defaultTableProps,
  extractPlan,
  FlexObject,
  getLocationColumns,
  jsxColumns,
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
import ConnectedJurisdictionMap, {
  defaultProps as jurisdictionMapDefaultProps,
} from '../../../JurisdictionMap';
import JurisdictionList from './helpers/JurisdictionList';

reducerRegistry.register(plansReducerName, plansReducer);

/** Interface for props that come from the URL */
export interface RouteParams {
  jurisdictionId: string;
}

/** Interface for FIJurisdiction component props */
export interface FIJurisdictionProps {
  completeReactivePlans: Plan[] | null;
  completeRoutinePlans: Plan[] | null;
  currentReactivePlans: Plan[] | null;
  currentRoutinePlans: Plan[] | null;
  fetchPlansActionCreator: typeof fetchPlans;
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI component */
export const defaultActiveFIProps: FIJurisdictionProps = {
  completeReactivePlans: null,
  completeRoutinePlans: null,
  currentReactivePlans: null,
  currentRoutinePlans: null,
  fetchPlansActionCreator: fetchPlans,
  supersetService: supersetFetch,
};

/** This component is meant to display a list of focus investigations for a
 * given jurisdiction.  It is meant to display for the focus area i.e. the
 * lowest level jurisdiction
 */
const FIJurisdiction = (props: FIJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const [loading, setLoading] = useState(true);

  const {
    completeReactivePlans,
    completeRoutinePlans,
    currentReactivePlans,
    currentRoutinePlans,
    fetchPlansActionCreator,
    supersetService,
  } = props;

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
  /** END */

  /** currentRoutineReactivePlans array that holds current routine and reactive tables  */
  const currentRoutineReactivePlans: FlexObject[] = [];
  /** completeRoutineReactivePlans array that holds complete routine and reactive tables  */
  const completeRoutineReactivePlans: FlexObject[] = [];
  /** Check if either currentReactivePlans or currentRoutinePlans length is greater than  zero
   * to build current section tables i.e (routine & reactive) with data
   */
  if (
    (currentReactivePlans && currentReactivePlans.length > 0) ||
    (currentRoutinePlans && currentRoutinePlans.length > 0)
  ) {
    [currentReactivePlans, currentRoutinePlans].forEach(plansArray => {
      if (plansArray && plansArray.length) {
        const thePlans = plansArray.map((item: Plan) => {
          let thisItem = extractPlan(item);
          // transform values of this properties if they are null
          const columnsToTransform = ['village', 'canton', 'district', 'province'];
          thisItem = transformValues(thisItem, columnsToTransform);
          return thisItem;
        });
        const locationColumns: Column[] = getLocationColumns(locationHierarchy, true);
        /**  Handle Columns Unique for Routine and Reactive Tables */
        const columnsBasedOnReason = [];
        /** If plan_fi_reason is Case Triggered then add currentReactivePlansColumns from settings */
        if (plansArray.every(d => d.plan_fi_reason === FIReasons[1])) {
          columnsBasedOnReason.push(...currentReactivePlansColumns);
        } else {
          /** Else build routine columns i.e (focusarea, locationcolumns, action and currentRoutinePlansColumn) */
          const focusAreaColumn = jsxColumns('focusarea');
          columnsBasedOnReason.push(
            ...locationColumns,
            ...focusAreaColumn,
            ...currentRoutinePlansColumn,
            ...jsxColumns('action')
          );
        }
        /** Handle all Columns i.e columns unique for reactive and routine (once handled above) plus columns common on both (name)  */
        const allColumns: Column[] = [
          ...jsxColumns('name'),
          ...statusColumn,
          ...columnsBasedOnReason,
        ];
        /** Contains columns and data that will build the table */
        const tableProps = {
          ...defaultTableProps,
          columns: allColumns,
          data: thePlans,
        };
        /** Push current tables and respective headers with data to be rendered */
        currentRoutineReactivePlans.push(
          <div key={thePlans[0].id}>
            <TableHeader plansArray={plansArray} />
            <DrillDownTable {...tableProps} />
          </div>
        );
      }
    });
  }
  /** if current reactive plans array is empty build table with no data  */
  if (!currentReactivePlans || !currentReactivePlans.length) {
    const tableProps = {
      ...defaultTableProps,
      columns: emptyCurrentReactivePlans,
    };
    currentRoutineReactivePlans.push(
      <NullDataTable
        key={`${'current'}-${FIReasons[1]}`}
        tableProps={tableProps}
        reasonType={FIReasons[1]}
      />
    );
  }
  /** if current routine plans array is empty build table with no data  */
  if (!currentRoutinePlans || !currentRoutinePlans.length) {
    const tableProps = {
      ...defaultTableProps,
      columns: emptyCurrentRoutinePlans,
    };
    currentRoutineReactivePlans.push(
      <NullDataTable
        key={`${'current'}-${FIReasons[0]}`}
        tableProps={tableProps}
        reasonType={FIReasons[0]}
      />
    );
  }

  /** Check if either completeReactivePlans or completeRoutinePlans length is greater than  zero
   * to build complete section tables i.e (routine & reactive) with data
   */
  if (
    (completeReactivePlans && completeReactivePlans.length > 0) ||
    (completeRoutinePlans && completeRoutinePlans.length > 0)
  ) {
    [completeReactivePlans, completeRoutinePlans].forEach(plansArray => {
      if (plansArray && plansArray.length) {
        const thePlans = plansArray.map((item: Plan) => {
          let thisItem = extractPlan(item);
          // transform values of this properties if they are null
          const columnsToTransform = ['village', 'canton', 'district', 'province'];
          thisItem = transformValues(thisItem, columnsToTransform);
          return thisItem;
        });
        /**  Handle Columns Unique for Routine and Reactive Tables */
        const columnsBasedOnReason = [];
        plansArray.every(d => d.plan_fi_reason === FIReasons[1])
          ? columnsBasedOnReason.push(...completeReactivePlansColumn)
          : columnsBasedOnReason.push(...completeRoutinePlansColumn);
        /** Handle all Columns i.e columns unique for reactive and routine (once handled above) plus columns common on both (name)  */
        const allColumns: Column[] = [
          ...jsxColumns('name'),
          ...dateCompletedColumn,
          ...columnsBasedOnReason,
        ];
        /** Contains columns and data that will build the table */
        const tableProps = {
          ...defaultTableProps,
          columns: allColumns,
          data: thePlans,
        };
        /** Push complete tables and respective headers with data to be rendered */
        completeRoutineReactivePlans.push(
          <div key={thePlans[0].id}>
            <TableHeader plansArray={plansArray} />
            <DrillDownTable {...tableProps} />
          </div>
        );
      }
    });
  }
  /** if complete reactive plans array is empty build table with no data  */
  if (!completeReactivePlans || !completeReactivePlans.length) {
    const tableProps = {
      ...defaultTableProps,
      columns: emptyCompleteReactivePlans,
    };
    completeRoutineReactivePlans.push(
      <NullDataTable
        key={`${'complete'}-${FIReasons[1]}`}
        tableProps={tableProps}
        reasonType={FIReasons[1]}
      />
    );
  }
  /** if complete routine plans array is empty build table with no data  */
  if (!completeRoutinePlans || !completeRoutinePlans.length) {
    const tableProps = {
      ...defaultTableProps,
      columns: emptyCompleteRoutinePlans,
    };
    completeRoutineReactivePlans.push(
      <NullDataTable
        key={`${'complete'}-${FIReasons[0]}`}
        tableProps={tableProps}
        reasonType={FIReasons[0]}
      />
    );
  }

  const jurisdictionMapProps = {
    ...jurisdictionMapDefaultProps,
    jurisdictionId,
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <div>Breadcrumbs</div>
      <h2 className="mb-3 mt-5 page-title">{pageTitle}</h2>
      <div>
        <ConnectedJurisdictionMap {...jurisdictionMapProps} />
      </div>
      <hr />
      <h4 className="mb-4">{CURRENT_FOCUS_INVESTIGATION}</h4>
      {currentRoutineReactivePlans}
      <h4 className="mb-4 complete">{COMPLETE_FOCUS_INVESTIGATION}</h4>
      <hr />
      {completeRoutineReactivePlans}
    </div>
  );
};

FIJurisdiction.defaultProps = defaultActiveFIProps;

const getPlansArray = makePlansArraySelector();

/** ObjectList options */
const objectListOptions = {
  actionCreator: fetchPlans,
  dispatchPropName: 'fetchPlansActionCreator',
  listPropName: 'completeRoutinePlans',
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
