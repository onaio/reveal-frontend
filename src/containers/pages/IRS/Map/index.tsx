import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetFormData } from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { BLACK, TASK_GREEN, TASK_ORANGE, TASK_RED, TASK_YELLOW } from '../../../../colors';
import GisidaWrapper from '../../../../components/GisidaWrapper';
import NotFound from '../../../../components/NotFound';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_IRS_REPORTING_PLANS_SLICE,
  SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
} from '../../../../configs/env';
import {
  HOME,
  HOME_URL,
  IRS_REPORTING_TITLE,
  MAP,
  REPORT_IRS_PLAN_URL,
} from '../../../../constants';
import ProgressBar from '../../../../helpers/ProgressBar';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import store from '../../../../store';
import IRSJurisdictionsReducer, {
  fetchIRSJurisdictions,
  getIRSJurisdictionsArray,
  IRSJurisdiction,
  reducerName as IRSJurisdictionsReducerName,
} from '../../../../store/ducks/IRS/jurisdictions';
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
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../store/ducks/jurisdictions';
import * as fixtures from '../JurisdictionsReport/tests/fixtures';
import { getGisidaWrapperProps, getJurisdictionBreadcrumbs } from './helpers';
import './style.css';

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(IRSJurisdictionsReducerName, IRSJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

const slices = SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');

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
  fetchFocusAreas: typeof fetchIRSJurisdictions;
  fetchJurisdictionsAction: typeof fetchJurisdictions;
  fetchPlans: typeof fetchIRSPlans;
  fetchStructures: typeof fetchGenericStructures;
  focusArea: IRSJurisdiction | null;
  jurisdiction: Jurisdiction | null;
  plan: IRSPlan | null;
  service: typeof supersetFetch;
  structures: StructureFeatureCollection | null;
}

/** IRSReportingMap default props */
const defaultProps: IRSReportingMapProps = {
  fetchFocusAreas: fetchIRSJurisdictions,
  fetchJurisdictionsAction: fetchJurisdictions,
  fetchPlans: fetchIRSPlans,
  fetchStructures: fetchGenericStructures,
  focusArea: null,
  jurisdiction: null,
  plan: null,
  service: supersetFetch,
  structures: null,
};

/** The IRS Reporting Map component */
const IRSReportingMap = (props: IRSReportingMapProps & RouteComponentProps<RouteParams>) => {
  const [loading, setLoading] = useState<boolean>(true);
  const {
    fetchFocusAreas,
    fetchJurisdictionsAction,
    fetchPlans,
    focusArea,
    fetchStructures,
    jurisdiction,
    plan,
    service,
    structures,
  } = props;

  let planId: string | null = null;
  if (props.match && props.match.params && props.match.params.planId) {
    planId = props.match.params.planId;
  }

  let jurisdictionId: string | null = null;
  if (props.match && props.match.params && props.match.params.jurisdictionId) {
    jurisdictionId = props.match.params.jurisdictionId;
  }

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(!focusArea || !jurisdiction || !plan || !structures); // set loading when there is no data
      let fetchPlansParams: SupersetFormData | null = null;
      if (planId) {
        fetchPlansParams = superset.getFormData(1, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
        ]);
      }

      // get the plan
      await service(SUPERSET_IRS_REPORTING_PLANS_SLICE, fetchPlansParams).then(
        (result: IRSPlan[]) => fetchPlans(result)
      );

      let fetchLocationParams: SupersetFormData | null = null;
      if (jurisdictionId) {
        fetchLocationParams = superset.getFormData(
          3000,
          [{ comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' }],
          { jurisdiction_depth: true }
        );
      }

      // get the jurisdiction
      await service(SUPERSET_JURISDICTIONS_SLICE, fetchLocationParams).then(
        (result: Jurisdiction[]) => fetchJurisdictionsAction(result)
      );

      // get the structures
      await service(SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE, fetchLocationParams).then(
        (result: GenericStructure[]) =>
          fetchGenericStructures(SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE, result)
      );

      const focusAreaSlice = slices.pop();
      if (focusAreaSlice) {
        // get the focus area
        await service(focusAreaSlice, fetchLocationParams).then((result: IRSJurisdiction[]) =>
          fetchFocusAreas(focusAreaSlice, result)
        );
      }
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!jurisdictionId || !planId) {
    return <NotFound />;
  }

  if (loading === true || (!focusArea || !jurisdiction || !plan || !structures)) {
    return <Loading />;
  }

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
