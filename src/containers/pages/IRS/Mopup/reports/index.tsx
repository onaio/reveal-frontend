import { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import {
  SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  SUPERSET_IRS_REPORTING_PLANS_SLICE,
} from '../../../../../configs/env';
import { MOP_UP_REPORTING_TITLE } from '../../../../../configs/lang';
import { IRS_MOP_UP_REPORT_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionsArray,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  genericFetchPlans,
  GenericPlan,
  getPlanByIdSelector,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import {
  GenericJurisdictionProps,
  GenericJurisdictionReport,
} from '../../../GenericJurisdictionReport';
import { getColumns, IRSMopupTableCell } from './helpers';

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

/** Renders IRS Jurisdictions reports */
const Mopup = (props: GenericJurisdictionProps & RouteComponentProps<RouteParams>) => {
  return (
    <div>
      <GenericJurisdictionReport {...props} />
    </div>
  );
};

const defaultProps = {
  LegendIndicatorComp: null,
  baseURL: IRS_MOP_UP_REPORT_URL,
  cellComponent: IRSMopupTableCell,
  columnsGetter: getColumns,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  focusAreaColumn: 'ZambiaIRSMopupFocusArea',
  focusAreaLevel: SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL,
  hasChildren: hasChildrenFunc,
  jurisdictionColumn: 'zambiaMopupJurisdiction',
  jurisdictions: null,
  pageTitle: MOP_UP_REPORTING_TITLE,
  plan: null,
  reportingPlanSlice: SUPERSET_IRS_REPORTING_PLANS_SLICE,
  service: supersetFetch,
  slices: SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
};

Mopup.defaultProps = defaultProps;

export { Mopup };

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
  defaultProps?.slices.forEach(
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
const ConnectedMopup = connect(mapStateToProps, mapDispatchToProps)(Mopup);

export default ConnectedMopup;
