import { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import SMCTableCell from '../../../../components/SMCCellTable';
import {
  SUPERSET_SMC_REPORTING_FOCUS_AREAS_COLUMNS,
  SUPERSET_SMC_REPORTING_JURISDICTIONS_COLUMNS,
  SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_SMC_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_SMC_REPORTING_PLANS_SLICE,
} from '../../../../configs/env';
import { SMC_REPORTING_TITLE } from '../../../../configs/lang';
import { REPORT_SMC_PLAN_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionsArray,
} from '../../../../store/ducks/generic/jurisdictions';
import { GenericPlan } from '../../../../store/ducks/generic/plans';
import SMCPlansReducer, {
  reducerName as SMCPlansReducerName,
  SMCPLANType,
} from '../../../../store/ducks/generic/SMCPlans';
import { fetchSMCPlans, getSMCPlanById } from '../../../../store/ducks/generic/SMCPlans';
import {
  GenericJurisdictionProps,
  GenericJurisdictionReport,
} from '../../GenericJurisdictionReport';
import '../../IRS/JurisdictionsReport/style.css';

/** register the reducers */
reducerRegistry.register(SMCPlansReducerName, SMCPlansReducer);

/** Renders SMC Jurisdictions reports */
const SMCJurisdictionReport = (
  props: GenericJurisdictionProps & RouteComponentProps<RouteParams>
) => {
  return (
    <div>
      <GenericJurisdictionReport {...props} />
    </div>
  );
};

const defaultProps: GenericJurisdictionProps = {
  LegendIndicatorComp: IRSIndicatorLegend,
  baseURL: REPORT_SMC_PLAN_URL,
  cellComponent: SMCTableCell,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: fetchSMCPlans,
  focusAreaColumn: SUPERSET_SMC_REPORTING_FOCUS_AREAS_COLUMNS,
  focusAreaLevel: SUPERSET_SMC_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  hasChildren: hasChildrenFunc,
  jurisdictionColumn: SUPERSET_SMC_REPORTING_JURISDICTIONS_COLUMNS,
  jurisdictions: null,
  pageTitle: SMC_REPORTING_TITLE,
  plan: null,
  reportingPlanSlice: SUPERSET_SMC_REPORTING_PLANS_SLICE,
  service: supersetFetch,
  slices: SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
};

SMCJurisdictionReport.defaultProps = defaultProps;

export { SMCJurisdictionReport };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps extends RouteComponentProps<RouteParams> {
  jurisdictions: GenericJurisdiction[] | null;
  plan: GenericPlan | SMCPLANType | null;
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const planId = ownProps.match.params.planId || null;
  const plan = planId ? getSMCPlanById(state, planId) : null;

  let jurisdictions: GenericJurisdiction[] = [];
  defaultProps.slices.forEach(
    (slice: string) =>
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
  fetchPlans: fetchSMCPlans,
};

/** Connected ActiveFI component */
const ConnectedSMCJurisdictionReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(SMCJurisdictionReport);

export default ConnectedSMCJurisdictionReport;
