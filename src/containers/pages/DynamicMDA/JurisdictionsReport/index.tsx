import { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import GenericTableCell from '../../../../components/TableCells/JurisdictionReport';
import {
  SUPERSET_DYNAMIC_MDA_REPORTING_FOCUS_AREAS_COLUMNS,
  SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_COLUMNS,
  SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_DYNAMIC_MDA_REPORTING_PLANS_SLICE,
} from '../../../../configs/env';
import { MDA_REPORTING_TITLE } from '../../../../configs/lang';
import { REPORT_MDA_PLAN_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionsArray,
} from '../../../../store/ducks/generic/jurisdictions';
import MDAPlansReducer, {
  genericFetchPlans,
  getPlanByIdSelector,
  reducerName as MDAPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import { GenericPlan } from '../../../../store/ducks/generic/plans';
import {
  GenericJurisdictionProps,
  GenericJurisdictionReport,
} from '../../GenericJurisdictionReport';
import './index.css';

/** register the reducers */
reducerRegistry.register(MDAPlansReducerName, MDAPlansReducer);

/** Renders MDA Jurisdictions reports */
const MDAJurisdictionReport = (
  props: GenericJurisdictionProps & RouteComponentProps<RouteParams>
) => {
  return (
    <div>
      <GenericJurisdictionReport {...props} />
    </div>
  );
};

const defaultProps: GenericJurisdictionProps = {
  LegendIndicatorComp: null,
  baseURL: REPORT_MDA_PLAN_URL,
  cellComponent: GenericTableCell,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  focusAreaColumn: SUPERSET_DYNAMIC_MDA_REPORTING_FOCUS_AREAS_COLUMNS,
  focusAreaLevel: SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  hasChildren: hasChildrenFunc,
  jurisdictionColumn: SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_COLUMNS,
  jurisdictions: null,
  pageTitle: MDA_REPORTING_TITLE,
  plan: null,
  reportingPlanSlice: SUPERSET_DYNAMIC_MDA_REPORTING_PLANS_SLICE,
  service: supersetFetch,
  slices: SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
};

MDAJurisdictionReport.defaultProps = defaultProps;

export { MDAJurisdictionReport };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps extends RouteComponentProps<RouteParams> {
  jurisdictions: GenericJurisdiction[] | null;
  plan: GenericPlan | null;
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: GenericJurisdictionProps & RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const planId = ownProps.match.params.planId || null;
  const plan = planId ? getPlanByIdSelector(state, planId) : null;

  let jurisdictions: GenericJurisdiction[] = [];
  defaultProps.slices.forEach(
    slice =>
      (jurisdictions = jurisdictions.concat(getGenericJurisdictionsArray(state, slice, planId)))
  );

  return {
    ...ownProps,
    jurisdictions,
    plan,
  };
};

/** map dispatch to props */
const mapDispatchToProps = {
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
};

/** Connected ActiveFI component */
const ConnectedMDAJurisdictionReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(MDAJurisdictionReport);

export default ConnectedMDAJurisdictionReport;
