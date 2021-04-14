import { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import MDALiteTableCell from '../../../../components/MDALiteCellTable';
import {
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS,
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE,
} from '../../../../configs/env';
import { MDA_LITE_REPORTING_TITLE } from '../../../../configs/lang';
import { REPORT_MDA_LITE_PLAN_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionsArray,
} from '../../../../store/ducks/generic/jurisdictions';
import GenericPlansReducer, {
  genericFetchPlans,
  getPlanByIdSelector,
  reducerName as genericPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import { GenericPlan } from '../../../../store/ducks/generic/plans';
import {
  GenericJurisdictionProps,
  GenericJurisdictionReport,
} from '../../GenericJurisdictionReport';
import '../../IRS/JurisdictionsReport/style.css';

/** register the reducers */
reducerRegistry.register(genericPlansReducerName, GenericPlansReducer);

/** Renders MDA Lite Jurisdictions reports */
const MdaLiteJurisdictionReport = (
  props: GenericJurisdictionProps & RouteComponentProps<RouteParams>
) => {
  return <GenericJurisdictionReport {...props} />;
};

// change indicator rows component indicatorRows default prop
IRSIndicatorLegend.defaultProps.indicatorRows = 'MDALiteIndicators';
// Default props
const defaultProps: GenericJurisdictionProps = {
  LegendIndicatorComp: IRSIndicatorLegend,
  baseURL: REPORT_MDA_LITE_PLAN_URL,
  cellComponent: MDALiteTableCell,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  focusAreaColumn: SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS,
  focusAreaLevel: SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  hasChildren: hasChildrenFunc,
  jurisdictionColumn: SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS,
  jurisdictions: null,
  pageTitle: MDA_LITE_REPORTING_TITLE,
  plan: null,
  reportingPlanSlice: SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE,
  service: supersetFetch,
  slices: SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
};

MdaLiteJurisdictionReport.defaultProps = defaultProps;

export { MdaLiteJurisdictionReport };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps extends RouteComponentProps<RouteParams> {
  jurisdictions: GenericJurisdiction[] | null;
  plan: GenericPlan | null;
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const planId = ownProps.match.params.planId || null;
  const plan = planId ? getPlanByIdSelector(state, planId) : null;

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
  fetchPlans: genericFetchPlans,
};

/** Connected ActiveFI component */
const ConnectedMdaLiteJurisdictionReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(MdaLiteJurisdictionReport);

export default ConnectedMdaLiteJurisdictionReport;
