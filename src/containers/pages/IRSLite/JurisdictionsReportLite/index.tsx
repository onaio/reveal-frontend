import { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import IRSTableCell from '../../../../components/IRSTableCell';
import {
  SUPERSET_IRS_LITE_REPORTING_FOCUS_AREAS_COLUMNS,
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_COLUMNS,
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE,
} from '../../../../configs/env';
import { IRS_LITE_REPORTING_TITLE } from '../../../../configs/lang';
import { REPORT_IRS_LITE_PLAN_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionsArray,
} from '../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  genericFetchPlans,
  GenericPlan,
  getPlanByIdSelector,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import {
  GenericJurisdictionProps,
  GenericJurisdictionReport,
} from '../../GenericJurisdictionReport';

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

/** Renders IRS Jurisdictions reports */
const JurisdictionReport = (props: GenericJurisdictionProps & RouteComponentProps<RouteParams>) => {
  return (
    <div>
      <GenericJurisdictionReport {...props} />
    </div>
  );
};

const defaultProps: GenericJurisdictionProps = {
  LegendIndicatorComp: IRSIndicatorLegend,
  baseURL: REPORT_IRS_LITE_PLAN_URL,
  cellComponent: IRSTableCell,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  focusAreaColumn: SUPERSET_IRS_LITE_REPORTING_FOCUS_AREAS_COLUMNS,
  focusAreaLevel: SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  hasChildren: hasChildrenFunc,
  jurisdictionColumn: SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_COLUMNS,
  jurisdictions: null,
  pageTitle: IRS_LITE_REPORTING_TITLE,
  plan: null,
  reportingPlanSlice: SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE,
  service: supersetFetch,
  slices: SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
};

JurisdictionReport.defaultProps = defaultProps;

export { JurisdictionReport };

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
const ConnectedJurisdictionReportLite = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionReport);

export default ConnectedJurisdictionReportLite;
