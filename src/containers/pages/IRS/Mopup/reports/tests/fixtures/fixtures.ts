import superset from '@onaio/superset-connector';

// tslint:disable: no-var-requires
export const mopupIRSJurisdictionsJSON = require('./zambia_irs_jurisdictions_mopup.json');
export const mopupfocuAreasJSON = require('./zambia_focus_areas_irs_mopup.json');
export const mopupPlansJSON = require('./zambia_irs_plans.json');

export const mopupIRSJurisdictions = superset.processData(mopupIRSJurisdictionsJSON) || [];
export const mopupFocusAreas = superset.processData(mopupfocuAreasJSON) || [];
export const mopupPlans = superset.processData(mopupPlansJSON) || [];
