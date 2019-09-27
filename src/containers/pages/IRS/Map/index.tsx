import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import Loading from '../../../../components/page/Loading';
import { wrapFeatureCollection } from '../../../../helpers/utils';
import { IRSJurisdiction } from '../../../../store/ducks/IRS/jurisdictions';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/IRS/plans';
import { StructureFeatureCollection } from '../../../../store/ducks/IRS/structures';
import { plans } from '../../../../store/ducks/IRS/tests/fixtures';
import * as fixtures from '../JurisdictionsReport/tests/fixtures';
import './style.css';

const ifocusAreas = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const ifocusArea = ifocusAreas.filter(
  e => e.jurisdiction_id === '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
)[0];
const ijurisdictions = superset.processData(fixtures.ZambiaAkros1JSON) || [];
const ijurisdiction = ijurisdictions[0];
const istructures = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];

/** interface for IRSReportingMap */
interface IRSReportingMapProps {
  focusArea: IRSJurisdiction;
  jurisdiction: IRSJurisdiction;
  plan: IRSPlan;
  structures: StructureFeatureCollection;
}

/** IRSReportingMap default props */
const defaultProps: IRSReportingMapProps = {
  focusArea: ifocusArea,
  jurisdiction: ijurisdiction,
  plan: plans[0] as IRSPlan,
  structures: wrapFeatureCollection(istructures),
};

const IRSReportingMap = (props: IRSReportingMapProps) => {
  const { focusArea, jurisdiction, plan, structures } = props;

  return <div>xxx</div>;
};

IRSReportingMap.defaultProps = defaultProps;

export { IRSReportingMap };
