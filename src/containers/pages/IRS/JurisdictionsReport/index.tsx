import { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import IRSIndicatorLegend from '../../../../components/formatting/IRSIndicatorLegend';
import IRSTableCell from '../../../../components/IRSTableCell';
import {
  SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS,
  SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS,
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_IRS_REPORTING_LOWER_JURISDICTIONS_COLUMNS,
  SUPERSET_IRS_REPORTING_PLANS_SLICE,
} from '../../../../configs/env';
import { IRS_REPORTING_TITLE } from '../../../../configs/lang';
import { REPORT_IRS_PLAN_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionsArray,
} from '../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  fetchIRSPlans,
  GenericPlan,
  getIRSPlanById,
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
  baseURL: REPORT_IRS_PLAN_URL,
  cellComponent: IRSTableCell,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: fetchIRSPlans,
  focusAreaColumn: SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS,
  focusAreaLevel: SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  hasChildren: hasChildrenFunc,
  jurisdictionColumn: SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS,
  jurisdictions: null,
  pageTitle: IRS_REPORTING_TITLE,
  plan: null,
  reportingPlanSlice: SUPERSET_IRS_REPORTING_PLANS_SLICE,
  service: supersetFetch,
  slices: SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
};

JurisdictionReport.defaultProps = defaultProps;

export { JurisdictionReport };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps extends RouteComponentProps<RouteParams> {
  jurisdictionColumn: string;
  jurisdictions: GenericJurisdiction[] | null;
  plan: GenericPlan | null;
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: GenericJurisdictionProps & RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const jurisdictionId = ownProps.match.params.jurisdictionId || null;
  const planId = ownProps.match.params.planId || null;
  const plan = planId ? getIRSPlanById(state, planId) : null;

  let jurisdictions: GenericJurisdiction[] = [];
  defaultProps.slices.forEach(
    slice =>
      (jurisdictions = jurisdictions.concat(getGenericJurisdictionsArray(state, slice, planId)))
  );
  let jurisdictionColumn = defaultProps.jurisdictionColumn;
  if (jurisdictionId && jurisdictions.length) {
    const juris = jurisdictions.filter(jur => jur.jurisdiction_id === jurisdictionId)[0];
    jurisdictionColumn =
      juris.jurisdiction_path.length > 0
        ? SUPERSET_IRS_REPORTING_LOWER_JURISDICTIONS_COLUMNS
        : jurisdictionColumn;
  }

  return {
    ...ownProps,
    jurisdictionColumn,
    jurisdictions,
    plan,
  };
};

/** map dispatch to props */
const mapDispatchToProps = {
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: fetchIRSPlans,
};

/** Connected ActiveFI component */
const ConnectedJurisdictionReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionReport);

export default ConnectedJurisdictionReport;
