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
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionByJurisdictionId,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import genericStructuresReducer, {
  fetchGenericStructures,
  GenericStructure,
  getGenericStructures,
  reducerName as genericStructuresReducerName,
  StructureFeatureCollection,
} from '../../../../store/ducks/generic/structures';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../store/ducks/jurisdictions';
import { getGisidaWrapperProps, getJurisdictionBreadcrumbs } from './helpers';
import './style.css';

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

const slices = SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');
const focusAreaSlice = slices.pop();

/** interface for IRSReportingMap */
interface IRSReportingMapProps {
  fetchFocusAreas: typeof fetchGenericJurisdictions;
  fetchJurisdictionsAction: typeof fetchJurisdictions;
  fetchPlans: typeof fetchIRSPlans;
  fetchStructures: typeof fetchGenericStructures;
  focusArea: GenericJurisdiction | null;
  jurisdiction: Jurisdiction | null;
  plan: IRSPlan | null;
  service: typeof supersetFetch;
  structures: StructureFeatureCollection | null;
}

/** IRSReportingMap default props */
const defaultProps: IRSReportingMapProps = {
  fetchFocusAreas: fetchGenericJurisdictions,
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

      let fetchLocationParams: SupersetFormData | null = null;
      if (jurisdictionId) {
        fetchLocationParams = superset.getFormData(1, [
          { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
        ]);
      }

      // get the jurisdiction
      await service(SUPERSET_JURISDICTIONS_SLICE, fetchLocationParams).then(
        (result: Jurisdiction[]) => fetchJurisdictionsAction(result)
      );

      let fetchStructureParams: SupersetFormData | null = null;
      if (jurisdictionId) {
        fetchStructureParams = superset.getFormData(3000, [
          { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
        ]);
      }

      // get the structures
      await service(SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE, fetchStructureParams).then(
        (result: GenericStructure[]) =>
          fetchStructures(SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE, result)
      );

      if (focusAreaSlice) {
        let fetchFocusAreaParams: SupersetFormData | null = null;
        if (jurisdictionId && planId) {
          fetchFocusAreaParams = superset.getFormData(1, [
            { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
            { comparator: planId, operator: '==', subject: 'plan_id' },
          ]);
        }
        // get the focus area
        await service(focusAreaSlice, fetchFocusAreaParams).then((result: GenericJurisdiction[]) =>
          fetchFocusAreas(focusAreaSlice, result)
        );
      }

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

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  focusArea: GenericJurisdiction | null;
  plan: IRSPlan | null;
  jurisdiction: Jurisdiction | null;
  structures: StructureFeatureCollection;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId = ownProps.match.params.planId || null;
  const jurisdictionId = ownProps.match.params.jurisdictionId || null;
  const plan = getIRSPlanById(state, planId);
  const jurisdiction = getJurisdictionById(state, jurisdictionId);
  const structures = getGenericStructures(
    state,
    SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE,
    jurisdictionId
  );
  let focusArea = null;
  if (focusAreaSlice && jurisdictionId) {
    focusArea = getGenericJurisdictionByJurisdictionId(state, focusAreaSlice, jurisdictionId);
  }

  return {
    focusArea,
    jurisdiction,
    plan,
    structures,
  };
};

/** map dispatch to props */
const mapDispatchToProps = {
  fetchFocusAreas: fetchGenericJurisdictions,
  fetchJurisdictionsAction: fetchJurisdictions,
  fetchPlans: fetchIRSPlans,
  fetchStructures: fetchGenericStructures,
};

/** Connected IRSReportingMap component */
const ConnectedIRSReportingMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(IRSReportingMap);

export default ConnectedIRSReportingMap;
