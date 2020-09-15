import { DrillDownColumn, DrillDownTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { format } from 'util';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import NullDataTable from '../../../../components/Table/NullDataTable';
import TableHeader from '../../../../components/Table/TableHeaders';
import { SUPERSET_MAX_RECORDS, SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import {
  AN_ERROR_OCCURRED,
  CANTON,
  COMPLETE_FOCUS_INVESTIGATION,
  CURRENT_FOCUS_INVESTIGATION,
  DISTRICT,
  FI_REASON,
  FI_STATUS,
  FIS_IN_JURISDICTION,
  FOCUS_AREA_INFO,
  FOCUS_INVESTIGATIONS,
  HOME,
  JURISDICTION_LOADING_ERROR,
  PROVINCE,
  REACTIVE,
  ROUTINE_TITLE,
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
import { FI_SINGLE_URL, FI_URL, HOME_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import {
  defaultTableProps,
  extractPlan,
  getFilteredFIPlansURL,
  getLocationColumns,
  jsxColumns,
  removeNullJurisdictionPlans,
  TablePropsType,
} from '../../../../helpers/utils';

import { supersetFIPlansParamFilters } from '../../../../helpers/dataLoading/plans';
import supersetFetch from '../../../../services/superset';
import { Jurisdiction } from '../../../../store/ducks/jurisdictions';
import plansReducer, {
  fetchPlans,
  FetchPlansAction,
  makePlansArraySelector,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import ConnectedJurisdictionMap, {
  defaultProps as jurisdictionMapDefaultProps,
} from '../../../JurisdictionMap';
import JurisdictionList from './helpers/JurisdictionList';
import './single.css';

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
export const FIJurisdiction = (props: FIJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const [loading, setLoading] = useState(true);
  const [errorOcurred, setErrorOcurred] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);

  const {
    completeReactivePlans,
    completeRoutinePlans,
    currentReactivePlans,
    currentRoutinePlans,
    fetchPlansActionCreator,
    supersetService,
  } = props;

  const jurisdictionId = props.match.params.jurisdictionId;

  let onePlan: Plan | null = null;
  if (
    completeReactivePlans &&
    completeRoutinePlans &&
    currentReactivePlans &&
    currentRoutinePlans
  ) {
    onePlan = completeReactivePlans.concat(
      completeRoutinePlans,
      currentReactivePlans,
      currentRoutinePlans
    )[0];
  }

  // this gets FI plans for the current jurisdiction
  const supersetParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
    { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
    ...supersetFIPlansParamFilters,
  ]);

  const jurisdictionCallback = (val: Jurisdiction) => {
    if (!jurisdiction) {
      setJurisdiction(val);
    }
  };

  const jurisdictionMapProps = {
    ...jurisdictionMapDefaultProps,
    callback: jurisdictionCallback,
    jurisdictionId,
  };

  useEffect(() => {
    supersetService(SUPERSET_PLANS_SLICE, supersetParams)
      .then((result: Plan[]) => {
        if (result) {
          fetchPlansActionCreator(result);
        } else {
          setErrorOcurred(true);
          displayError(new Error(AN_ERROR_OCCURRED));
        }
      })
      .finally(() => setLoading(false))
      .catch(err => {
        setErrorOcurred(true);
        displayError(err);
      });
  }, []);

  if (loading === true) {
    return <Loading />;
  }

  if (errorOcurred === true) {
    return <div>{JURISDICTION_LOADING_ERROR}</div>;
  }

  const jurisdictionName =
    jurisdiction && jurisdiction.geojson ? jurisdiction.geojson.properties.jurisdiction_name : '';

  const pageTitle = jurisdictionName !== '' ? format(FIS_IN_JURISDICTION, jurisdictionName) : '';

  const basePage = {
    label: FOCUS_INVESTIGATIONS,
    url: FI_URL,
  };
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: basePage,
    pages: [homePage, basePage],
  };
  if (onePlan && jurisdiction) {
    breadCrumbProps.currentPage = {
      label: jurisdictionName,
      url: `${FI_SINGLE_URL}/${jurisdictionId}`,
    };
    const namePaths =
      onePlan.jurisdiction_name_path instanceof Array ? onePlan.jurisdiction_name_path : [];

    namePaths.forEach((namePath, i) => {
      if (onePlan) {
        breadCrumbProps.pages.push({
          label: namePath,
          url: getFilteredFIPlansURL(onePlan.jurisdiction_path[i], onePlan.id),
        });
      }
    });
  }

  /** theObject holds extracted plans from superset response */
  const theObject = onePlan ? extractPlan(onePlan) : null;

  /** currentRoutineReactivePlans array that holds current routine and reactive tables  */
  const currentRoutineReactivePlans: Dictionary[] = [];
  /** completeRoutineReactivePlans array that holds complete routine and reactive tables  */
  const completeRoutineReactivePlans: Dictionary[] = [];
  /** Check if either currentReactivePlans or currentRoutinePlans length is greater than  zero
   * to build current section tables i.e (routine & reactive) with data
   */
  if (
    (currentReactivePlans && currentReactivePlans.length > 0) ||
    (currentRoutinePlans && currentRoutinePlans.length > 0)
  ) {
    [currentReactivePlans, currentRoutinePlans].forEach(plansArray => {
      if (plansArray && plansArray.length) {
        const jurisdictionValidPlans = removeNullJurisdictionPlans(plansArray);
        const thePlans = jurisdictionValidPlans.map((item: Plan) => {
          return extractPlan(item);
        });
        const locationColumns: Array<DrillDownColumn<Dictionary>> = getLocationColumns(
          locationHierarchy,
          true
        );
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
        const allColumns = [...jsxColumns('name'), ...statusColumn, ...columnsBasedOnReason];
        /** Contains columns and data that will build the table */
        const tableProps: TablePropsType = {
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
    const tableProps: TablePropsType = {
      ...defaultTableProps,
      columns: emptyCurrentReactivePlans,
    };
    currentRoutineReactivePlans.push(
      <NullDataTable
        key={`${'current'}-${REACTIVE}`}
        tableProps={tableProps}
        reasonType={REACTIVE}
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
        key={`${'current'}-${ROUTINE_TITLE}`}
        tableProps={tableProps}
        reasonType={ROUTINE_TITLE}
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
        const jurisdictionValidPlans = removeNullJurisdictionPlans(plansArray);
        const thePlans = jurisdictionValidPlans.map((item: Plan) => {
          return extractPlan(item);
        });
        /**  Handle Columns Unique for Routine and Reactive Tables */
        const columnsBasedOnReason = [];
        plansArray.every(d => d.plan_fi_reason === FIReasons[1])
          ? columnsBasedOnReason.push(...completeReactivePlansColumn)
          : columnsBasedOnReason.push(...completeRoutinePlansColumn);
        /** Handle all Columns i.e columns unique for reactive and routine (once handled above) plus columns common on both (name)  */
        const allColumns: Array<DrillDownColumn<Dictionary>> = [
          ...jsxColumns('name'),
          ...dateCompletedColumn,
          ...columnsBasedOnReason,
        ];
        /** Contains columns and data that will build the table */
        const tableProps: TablePropsType = {
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
        key={`${'complete'}-${REACTIVE}`}
        tableProps={tableProps}
        reasonType={REACTIVE}
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
        key={`${'complete'}-${ROUTINE_TITLE}`}
        tableProps={tableProps}
        reasonType={ROUTINE_TITLE}
      />
    );
  }

  return (
    <div className="mb-5">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumbs {...breadCrumbProps} />
      <h2 className="page-title mt-4 mb-5">{pageTitle}</h2>
      <Row>
        <Col className="col-6">
          <h4 className="mb-4 focus-area-info-title">{FOCUS_AREA_INFO}</h4>
          <ConnectedJurisdictionMap {...jurisdictionMapProps} />
        </Col>
        {theObject && (
          <Col className="col-6 focus-area-info-section">
            <dl className="row mt-3">
              <dt className="col-4">{PROVINCE}</dt>
              <dd className="col-8">{theObject.province}</dd>
              <dt className="col-4">{DISTRICT}</dt>
              <dd className="col-8">{theObject.district}</dd>
              <dt className="col-4">{CANTON}</dt>
              <dd className="col-8">{theObject.canton}</dd>
              <dt className="col-4">{FI_STATUS}</dt>
              <dd className="col-8">{theObject.status}</dd>
              <dt className="col-4">{FI_REASON}</dt>
              <dd className="col-8">{theObject.reason}</dd>
            </dl>
          </Col>
        )}
      </Row>
      <hr />
      <h4 className="mb-4 fi-table current">{CURRENT_FOCUS_INVESTIGATION}</h4>
      <div className="current-plans">{currentRoutineReactivePlans}</div>
      <h4 className="mb-4 fi-table complete">{COMPLETE_FOCUS_INVESTIGATION}</h4>
      <hr />
      <div className="complete-plans">{completeRoutineReactivePlans}</div>
    </div>
  );
};

FIJurisdiction.defaultProps = defaultActiveFIProps;

const getPlansArray = makePlansArraySelector();

/** ObjectList options */
const objectListOptions = {
  actionCreator: fetchPlans,
  dispatchPropName: 'fetchPlansActionCreator',
  returnPropName: 'completeRoutinePlans',
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
