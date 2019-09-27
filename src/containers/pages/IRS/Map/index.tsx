import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Col, Row } from 'reactstrap';
import { BLACK, TASK_GREEN, TASK_ORANGE, TASK_RED, TASK_YELLOW } from '../../../../colors';
import GisidaWrapper from '../../../../components/GisidaWrapper';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  HOME,
  HOME_URL,
  IRS_REPORTING_TITLE,
  MAP,
  REPORT_IRS_PLAN_URL,
} from '../../../../constants';
import ProgressBar from '../../../../helpers/ProgressBar';
import store from '../../../../store';
import { IRSJurisdiction } from '../../../../store/ducks/IRS/jurisdictions';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/IRS/plans';
import genericStructuresReducer, {
  fetchGenericStructures,
  GenericStructure,
  getGenericStructures,
  reducerName as genericStructuresReducerName,
  StructureFeatureCollection,
} from '../../../../store/ducks/IRS/structures';
import { plans } from '../../../../store/ducks/IRS/tests/fixtures';
import * as fixtures from '../JurisdictionsReport/tests/fixtures';
import { getGisidaWrapperProps, getJurisdictionBreadcrumbs } from './helpers';
import './style.css';

reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

const ifocusAreas = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const ifocusArea = ifocusAreas
  .map((structure: IRSJurisdiction) => {
    /** ensure jurisdiction_name_path is parsed */
    if (typeof structure.jurisdiction_name_path === 'string') {
      structure.jurisdiction_name_path = JSON.parse(structure.jurisdiction_name_path);
    }
    /** ensure jurisdiction_path is parsed */
    if (typeof structure.jurisdiction_path === 'string') {
      structure.jurisdiction_path = JSON.parse(structure.jurisdiction_path);
    }
    return structure as IRSJurisdiction;
  })
  .filter(e => e.jurisdiction_id === '0dc2d15b-be1d-45d3-93d8-043a3a916f30')[0];
let ijurisdictions = superset.processData(fixtures.ZambiaAkros1JSON) || [];
ijurisdictions = ijurisdictions.map((structure: any) => {
  /** ensure geojson is parsed */
  if (typeof structure.geojson === 'string') {
    structure.geojson = JSON.parse(structure.geojson);
  }
  /** ensure geometry is parsed */
  if (typeof structure.geojson.geometry === 'string') {
    structure.geojson.geometry = JSON.parse(structure.geojson.geometry);
  }
  /** ensure jurisdiction_name_path is parsed */
  if (typeof structure.jurisdiction_name_path === 'string') {
    structure.jurisdiction_name_path = JSON.parse(structure.jurisdiction_name_path);
  }
  /** ensure jurisdiction_path is parsed */
  if (typeof structure.jurisdiction_path === 'string') {
    structure.jurisdiction_path = JSON.parse(structure.jurisdiction_path);
  }
  return structure as GenericStructure;
});
const ijurisdiction = ijurisdictions[0];
const istructures = superset.processData(fixtures.ZambiaStructuresJSON) || [];

store.dispatch(fetchGenericStructures('zm-structures', istructures as GenericStructure[]));

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
  structures: getGenericStructures(store.getState(), 'zm-structures', ifocusArea.jurisdiction_id),
};

/** The IRS Reporting Map component */
const IRSReportingMap = (props: IRSReportingMapProps) => {
  const { focusArea, jurisdiction, plan, structures } = props;

  const baseURL = `${REPORT_IRS_PLAN_URL}/${plan.plan_id}`;
  const focusAreaURL = `${baseURL}/${focusArea.jurisdiction_id}`;

  const pageTitle = plan.plan_title;

  const breadcrumbProps = {
    currentPage: {
      label: `${focusArea.jurisdiction_name} ${MAP}`,
      url: `${focusAreaURL}/map`,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: IRS_REPORTING_TITLE,
        url: baseURL,
      },
    ],
  };

  const jurisdictionBreadCrumbs = getJurisdictionBreadcrumbs(focusArea, baseURL);

  jurisdictionBreadCrumbs.push({
    label: focusArea.jurisdiction_name,
    url: `${baseURL}/${focusArea.jurisdiction_id}`,
  });

  const newPages = breadcrumbProps.pages.concat(jurisdictionBreadCrumbs);
  breadcrumbProps.pages = newPages;

  const sidebarLegendStops = [
    ['Complete', TASK_GREEN],
    ['Not Sprayed', TASK_RED],
    ['Partially Sprayed', TASK_ORANGE],
    ['Not Visited', TASK_YELLOW],
    ['Not Eligible', BLACK],
  ];

  const sidebarIndicatorRows = [
    {
      denominator: focusArea ? (focusArea as any).totstruct || 0 : 0,
      description: 'Percent of structures sprayed over found',
      numerator: focusArea ? (focusArea as any).foundstruct || 0 : 0,
      title: 'Found Coverage',
      value: focusArea ? Math.round(((focusArea as any).spraytarg || 0) * 100) : 0,
    },
    {
      denominator: focusArea ? (focusArea as any).totstruct || 0 : 0,
      description: 'Percent of structures sprayed over total',
      numerator: focusArea ? (focusArea as any).sprayedstruct || 0 : 0,
      title: 'Spray Coverage (Effectiveness)',
      value: focusArea ? Math.round(((focusArea as any).spraycov || 0) * 100) : 0,
    },
    {
      denominator: focusArea ? (focusArea as any).foundstruct || 0 : 0,
      description: 'Percent of structures sprayed over found',
      numerator: focusArea ? (focusArea as any).sprayedstruct || 0 : 0,
      title: 'Spray Success Rate (PMI SC)',
      value: focusArea ? Math.round(((focusArea as any).spraysuccess || 0) * 100) : 0,
    },
  ];

  const indicatorThresholds = {
    GREEN_THRESHOLD: {
      color: '#2ECC40',
      value: 1,
    },
    GREY_THRESHOLD: {
      color: '#dddddd',
      value: 0.2,
    },
    RED_THRESHOLD: {
      color: '#FF4136',
      orEquals: true,
      value: 0.75,
    },
    YELLOW_THRESHOLD: {
      color: '#FFDC00',
      value: 0.9,
    },
  };

  const gisidaWrapperProps = getGisidaWrapperProps(jurisdiction, structures);

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{pageTitle}</h3>
        </Col>
      </Row>
      <Row noGutters={true}>
        <Col xs={9}>
          {gisidaWrapperProps ? (
            <div className="map irs-reporting-map">
              <GisidaWrapper {...gisidaWrapperProps} />
            </div>
          ) : (
            <div>Could not load the map</div>
          )}
        </Col>
        <Col xs={3}>
          <div className="mapSidebar">
            <h5>{focusArea && focusArea.jurisdiction_name}</h5>
            <hr />

            {sidebarLegendStops && (
              <div className="mapLegend">
                <h6>Legend</h6>
                {sidebarLegendStops.map((stop, i) => (
                  <div className="sidebar-legend-item" key={i}>
                    <span className="sidebar-legend-color" style={{ backgroundColor: stop[1] }} />
                    <span className="sidebar-legend-label">{stop[0]}</span>
                  </div>
                ))}
                <hr />
              </div>
            )}

            {sidebarIndicatorRows.map((row, i) => (
              <div className="responseItem" key={i}>
                <h6>{row.title}</h6>
                <p className="indicator-description">{row.description}</p>
                <ProgressBar indicatorThresholds={indicatorThresholds || null} value={row.value} />
                <p className="indicator-breakdown">
                  Progress: {row.numerator} of {row.denominator} structures ({row.value}%)
                </p>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

IRSReportingMap.defaultProps = defaultProps;

export { IRSReportingMap };
