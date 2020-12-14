import { ProgressBar } from '@onaio/progress-indicators';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetFormData } from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { format } from 'util';
import { MemoizedGisidaLite } from '../../../../components/GisidaLite';
import { getZoomCenterAndBounds } from '../../../../components/GisidaLite/helpers';
import NotFound from '../../../../components/NotFound';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  HIDDEN_MAP_LEGEND_ITEMS,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_MAX_RECORDS,
  SUPERSET_SMC_REPORTING_INDICATOR_ROWS,
  SUPERSET_SMC_REPORTING_INDICATOR_STOPS,
  SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_SMC_REPORTING_PLANS_SLICE,
  SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE,
} from '../../../../configs/env';
import {
  AN_ERROR_OCCURRED,
  HOME,
  LEGEND_LABEL,
  MAP_LOAD_ERROR,
  NUMERATOR_OF_DENOMINATOR_UNITS,
  PROGRESS,
  SMC_REPORTING_TITLE,
  STRUCTURES,
} from '../../../../configs/lang';
import { indicatorThresholdsIRS } from '../../../../configs/settings';
import {
  BUSINESS_STATUS,
  CIRCLE_PAINT_COLOR_CATEGORICAL_TYPE,
  DefaultMapDimensions,
  HOME_URL,
  REPORT_SMC_PLAN_URL,
  SMC_REPORT_STRUCTURES,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionByJurisdictionId,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../store/ducks/generic/jurisdictions';
import SMCPlansReducer, {
  fetchSMCPlans,
  getSMCPlanById,
  reducerName as SMCPlansReducerName,
  SMCPLANType,
} from '../../../../store/ducks/generic/SMCPlans';
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
import {
  buildGsLiteLayers,
  buildJurisdictionLayers,
  CircleColor,
  PolygonColor,
} from '../../FocusInvestigation/map/active/helpers/utils';
import {
  getIndicatorRows,
  getJurisdictionBreadcrumbs,
  mapOnClickHandler,
} from '../../IRS/Map/helpers';
import { defaultIndicatorStop, SMCIndicatorRows, SMCIndicatorStops } from './helpers';
import './style.css';

/** register the reducers */
reducerRegistry.register(SMCPlansReducerName, SMCPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

const slices = SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');
const focusAreaSlice = slices.pop();

/** interface for SMCReportingMap */
interface SMCReportingMapProps {
  fetchFocusAreas: typeof fetchGenericJurisdictions;
  fetchJurisdictionsAction: typeof fetchJurisdictions;
  fetchPlans: typeof fetchSMCPlans;
  fetchStructures: typeof fetchGenericStructures;
  focusArea: GenericJurisdiction | null;
  jurisdiction: Jurisdiction | null;
  plan: SMCPLANType | null;
  service: typeof supersetFetch;
  structures: StructureFeatureCollection | null;
}

/** SMCReportingMap default props */
const defaultProps: SMCReportingMapProps = {
  fetchFocusAreas: fetchGenericJurisdictions,
  fetchJurisdictionsAction: fetchJurisdictions,
  fetchPlans: fetchSMCPlans,
  fetchStructures: fetchGenericStructures,
  focusArea: null,
  jurisdiction: null,
  plan: null,
  service: supersetFetch,
  structures: null,
};

/** The SMC Reporting Map component */
const SMCReportingMap = (props: SMCReportingMapProps & RouteComponentProps<RouteParams>) => {
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
      await service(
        SUPERSET_JURISDICTIONS_SLICE,
        fetchLocationParams
      ).then((result: Jurisdiction[]) => fetchJurisdictionsAction(result));

      let fetchStructureParams: SupersetFormData | null = null;
      if (jurisdictionId && planId) {
        fetchStructureParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
          { comparator: planId, operator: '==', subject: 'plan_id' },
        ]);
      }

      // get the structures
      await service(
        SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE,
        fetchStructureParams
      ).then((result: GenericStructure[]) =>
        fetchStructures(SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE, result)
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
      await service(
        SUPERSET_SMC_REPORTING_PLANS_SLICE,
        fetchPlansParams
      ).then((result: SMCPLANType[]) => fetchPlans(result));
    } catch (e) {
      displayError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData()
      .finally(() => setLoading(false))
      .catch(e => displayError(e));
  }, []);

  if (!jurisdictionId || !planId) {
    return <NotFound />;
  }

  if (loading === true) {
    return <Loading />;
  }

  if (!focusArea || !plan || !jurisdiction) {
    return <ErrorPage errorMessage={AN_ERROR_OCCURRED} />;
  }

  const baseURL = `${REPORT_SMC_PLAN_URL}/${plan.plan_id}`;
  const focusAreaURL = `${baseURL}/${focusArea.jurisdiction_id}`;

  const pageTitle = `${plan.plan_title}: ${focusArea.jurisdiction_name}`;

  const breadcrumbProps = {
    currentPage: {
      label: `${focusArea.jurisdiction_name}`,
      url: `${focusAreaURL}/map`,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: SMC_REPORTING_TITLE,
        url: REPORT_SMC_PLAN_URL,
      },
      {
        label: plan.plan_title,
        url: baseURL,
      },
    ],
  };

  const jurisdictionBreadCrumbs = getJurisdictionBreadcrumbs(focusArea, baseURL);

  const newPages = breadcrumbProps.pages.concat(jurisdictionBreadCrumbs);
  breadcrumbProps.pages = newPages;

  const indicatorRows = get(SMCIndicatorRows, SUPERSET_SMC_REPORTING_INDICATOR_ROWS, null);
  let sidebarIndicatorRows = null;
  if (indicatorRows !== null) {
    sidebarIndicatorRows = getIndicatorRows(indicatorRows, focusArea);
  }

  const indicatorStops = get(
    SMCIndicatorStops,
    SUPERSET_SMC_REPORTING_INDICATOR_STOPS,
    defaultIndicatorStop
  );

  // get map zoom, center and bounds
  const { zoom, mapBounds, mapCenter } = getZoomCenterAndBounds(
    structures,
    jurisdiction,
    DefaultMapDimensions
  );

  // define circle paint colors
  const circleColor: CircleColor = {
    property: BUSINESS_STATUS,
    stops: indicatorStops,
    type: CIRCLE_PAINT_COLOR_CATEGORICAL_TYPE,
  };
  // define polygon paint colors
  const polygonColor: PolygonColor = {
    property: BUSINESS_STATUS,
    stops: indicatorStops,
    type: CIRCLE_PAINT_COLOR_CATEGORICAL_TYPE,
  };
  // define polygon line paint colors
  const polygonLineColor: PolygonColor = {
    property: BUSINESS_STATUS,
    stops: indicatorStops,
    type: CIRCLE_PAINT_COLOR_CATEGORICAL_TYPE,
  };

  // map layers
  const jurisdictionLayers = buildJurisdictionLayers(jurisdiction);
  const structuresLayers = buildGsLiteLayers(SMC_REPORT_STRUCTURES, null, structures as any, {
    circleColor,
    polygonColor,
    polygonLineColor,
  });

  const gsLayers = [...jurisdictionLayers, ...structuresLayers];

  /**
   * Create list elements from dictionary
   * @param {Dictionary} dict
   */
  const processListDisplay = (dict: Dictionary | string) => {
    const createList = (obj: Dictionary) =>
      Object.entries(obj).map(([key, val]) => (
        <li key={key} className="indicator-breakdown">
          {key} - {val} {STRUCTURES}
        </li>
      ));
    return typeof dict === 'string' ? createList(JSON.parse(dict)) : createList(dict);
  };

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
          {gsLayers ? (
            <div className="map irs-reporting-map">
              <MemoizedGisidaLite
                layers={[...gsLayers]}
                zoom={zoom}
                mapCenter={mapCenter}
                mapBounds={mapBounds}
                onClickHandler={mapOnClickHandler}
              />
            </div>
          ) : (
            <div>{MAP_LOAD_ERROR}</div>
          )}
        </Col>
        <Col xs={3}>
          <div className="mapSidebar">
            <h5>{focusArea && focusArea.jurisdiction_name}</h5>
            <hr />

            {indicatorStops && (
              <div className="mapLegend">
                <h6>{LEGEND_LABEL}</h6>
                {indicatorStops.map(
                  (stop, i) =>
                    !HIDDEN_MAP_LEGEND_ITEMS.includes(stop[0]) && (
                      <div className="sidebar-legend-item" key={i}>
                        <span
                          className="sidebar-legend-color"
                          style={{ backgroundColor: stop[1] }}
                        />
                        <span className="sidebar-legend-label">{stop[0]}</span>
                      </div>
                    )
                )}
                <hr />
              </div>
            )}

            {sidebarIndicatorRows &&
              sidebarIndicatorRows.map((row, i) => (
                <div className="responseItem" key={i}>
                  <h6>{row.title}</h6>
                  {!row.listDisplay && <p className="indicator-description">{row.description}</p>}
                  {!row.listDisplay && (
                    <ProgressBar
                      lineColorThresholds={indicatorThresholdsIRS || null}
                      value={row.value}
                    />
                  )}
                  <p className="indicator-breakdown">
                    {!row.listDisplay && `${PROGRESS}: `}
                    {format(
                      NUMERATOR_OF_DENOMINATOR_UNITS,
                      row.listDisplay
                        ? Number(row.denominator) - Number(row.numerator)
                        : row.numerator,
                      row.denominator,
                      row.unit || STRUCTURES
                    )}{' '}
                    {!row.listDisplay && `(${row.value}%)`}
                  </p>
                  {row.listDisplay && (
                    <ul className="list-unstyled">{processListDisplay(row.listDisplay)}</ul>
                  )}
                </div>
              ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

SMCReportingMap.defaultProps = defaultProps;

export { SMCReportingMap };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  focusArea: GenericJurisdiction | null;
  plan: SMCPLANType | null;
  jurisdiction: Jurisdiction | null;
  structures: StructureFeatureCollection;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId = ownProps.match.params.planId || null;
  const jurisdictionId = ownProps.match.params.jurisdictionId || null;
  const plan = getSMCPlanById(state, planId);
  const jurisdiction = getJurisdictionById(state, jurisdictionId);
  const structures = getGenericStructures(
    state,
    SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE,
    jurisdictionId,
    planId
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
  fetchPlans: fetchSMCPlans,
  fetchStructures: fetchGenericStructures,
};

/** Connected SMCReportingMap component */
const ConnectedSMCReportingMap = connect(mapStateToProps, mapDispatchToProps)(SMCReportingMap);

export default ConnectedSMCReportingMap;
