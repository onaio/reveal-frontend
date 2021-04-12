import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetAdhocFilterOption } from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import { centroid, featureCollection, polygon as turfPolygon } from '@turf/turf';
import geojson from 'geojson';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { GeoJSONLayer } from 'react-mapbox-gl';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { MemoizedGisidaLite } from '../../../../components/GisidaLite';
import { getZoomCenterAndBounds } from '../../../../components/GisidaLite/helpers';
import NotFound from '../../../../components/NotFound';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_MAX_RECORDS,
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE,
  SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE,
} from '../../../../configs/env';
import {
  HOME,
  MAP_LOAD_ERROR,
  MDA_LITE_REPORTING_TITLE,
  SUBCOUNTY_LABEL,
} from '../../../../configs/lang';
import {
  DefaultMapDimensions,
  HOME_URL,
  MDA_LITE_STRUCTURES,
  POLYGON,
  REPORT_MDA_LITE_PLAN_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getAllGenericJurisdictionByJurisdictionId,
  reducerName as genericJurisdictionsReducerName,
} from '../../../../store/ducks/generic/jurisdictions';
import GenericPlansReducer, {
  genericFetchPlans,
  GenericPlan,
  getPlanByIdSelector,
  reducerName as genericPlanReducerName,
} from '../../../../store/ducks/generic/plans';
import genericStructuresReducer, {
  fetchGenericStructures,
  getGenericStructures,
  reducerName as genericStructuresReducerName,
  StructureFeatureCollection,
} from '../../../../store/ducks/generic/structures';
import { buildGsLiteLayers } from '../../FocusInvestigation/map/active/helpers/utils';

/** register the reducers */
reducerRegistry.register(genericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericPlanReducerName, GenericPlansReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

/** MDA Lite map props */
interface MDALiteMapProps {
  baseUrl: string;
  fetchJurisdictions: typeof fetchGenericJurisdictions;
  fetchPlans: typeof genericFetchPlans;
  fetchWards: typeof fetchGenericStructures;
  planData: GenericPlan | null;
  service: typeof supersetFetch;
  slices: string[];
  subcountyData: GenericJurisdiction[];
  wardData: StructureFeatureCollection | null;
}

/** Component for displaying MDA lite ward map */
const MDALiteMapReport = (props: MDALiteMapProps & RouteComponentProps<RouteParams>) => {
  const {
    wardData,
    service,
    fetchWards,
    fetchPlans,
    planData,
    subcountyData,
    slices,
    fetchJurisdictions,
    baseUrl,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const { params } = props.match;
  const { planId, jurisdictionId } = params;

  // load data
  async function loadData() {
    setLoading(!wardData);
    try {
      const planIdFilter: SupersetAdhocFilterOption[] = [];
      const jurisdictionFilter: SupersetAdhocFilterOption[] = [];
      if (jurisdictionId && planId) {
        jurisdictionFilter.push({
          comparator: jurisdictionId,
          operator: '==',
          subject: 'jurisdiction_id',
        });
        planIdFilter.push({ comparator: planId, operator: '==', subject: 'plan_id' });
        // get ward data
        const supersetFilters = superset.getFormData(SUPERSET_MAX_RECORDS, [
          ...planIdFilter,
          ...jurisdictionFilter,
        ]);
        await service(SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE, supersetFilters).then(res =>
          fetchWards(SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE, res)
        );
        // get plan data
        if (!planData) {
          const planDataFilter = superset.getFormData(SUPERSET_MAX_RECORDS, [...planIdFilter]);
          await service(SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE, planDataFilter).then(res =>
            fetchPlans(res)
          );
        }
        // get subcounty data
        if (!subcountyData.length) {
          slices.forEach(async slice => {
            await service(slice, supersetFilters).then(res => fetchJurisdictions(slice, res));
          });
        }
      }
    } catch (e) {
      displayError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, [planId, jurisdictionId]);

  if (loading) {
    return <Loading />;
  }

  if (!jurisdictionId || !planId) {
    return <NotFound />;
  }

  const jurBreadcrumb = [];
  if (planData && subcountyData.length) {
    jurBreadcrumb.push({
      label: planData.plan_title,
      url: `${baseUrl}/${planData.plan_id}`,
    });
    const paths = subcountyData[0].jurisdiction_path;
    const names = subcountyData[0].jurisdiction_name_path;
    if (paths?.length && names?.length) {
      paths.forEach((_, index) => {
        jurBreadcrumb.push({
          label: names[index],
          url: `${baseUrl}/${planData.plan_id}/${paths[index]}`,
        });
      });
    }
  }

  const currentPage = {
    label: subcountyData[0]?.jurisdiction_name || SUBCOUNTY_LABEL,
    url: '',
  };

  const pageTitle = `${MDA_LITE_REPORTING_TITLE}: ${currentPage.label}`;
  const breadcrumbProps = {
    currentPage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: MDA_LITE_REPORTING_TITLE,
        url: baseUrl,
      },
      ...jurBreadcrumb,
    ],
  };

  // get map zoom, center and bounds
  const { zoom, mapBounds, mapCenter } = getZoomCenterAndBounds(
    wardData,
    null,
    DefaultMapDimensions
  );

  const polygons = wardData?.features.filter(feature => [POLYGON].includes(feature.geometry.type));

  // get each polygon centroid
  const centroidPoints = polygons?.map(polygon => {
    const genPolygon = turfPolygon((polygon as Dictionary).geometry?.coordinates);
    const genCentroids = centroid(genPolygon);
    return {
      ...genCentroids,
      properties: polygon.properties,
    };
  });

  const polygonsFC = polygons ? featureCollection(polygons) : null;
  const pointsFC = centroidPoints ? featureCollection(centroidPoints) : null;

  const preferedColor = '#FFDC00'; // color for map lite and map text
  const wardLayers = buildGsLiteLayers(
    MDA_LITE_STRUCTURES,
    null,
    polygonsFC as geojson.FeatureCollection,
    {
      polygonLinePaintColor: preferedColor,
    }
  );

  // layer for drawing displaying text on map
  if (pointsFC) {
    wardLayers.push(
      <GeoJSONLayer
        symbolLayout={{
          'text-anchor': 'top',
          'text-field': '{name}\n{total_males} M / {total_females} F',
          'text-offset': [0, 0.6],
          'text-size': 16,
        }}
        symbolPaint={{
          'text-color': preferedColor,
        }}
        id={`${MDA_LITE_STRUCTURES}-symbol`}
        key={`${MDA_LITE_STRUCTURES}-symbol`}
        data={pointsFC}
      />
    );
  }

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{pageTitle}</h3>
          <div className="generic-report-table">
            {wardLayers.length ? (
              <MemoizedGisidaLite
                layers={[...wardLayers]}
                zoom={zoom}
                mapCenter={mapCenter}
                mapBounds={mapBounds}
              />
            ) : (
              <div>{MAP_LOAD_ERROR}</div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

const defaultProps: MDALiteMapProps = {
  baseUrl: REPORT_MDA_LITE_PLAN_URL,
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  fetchWards: fetchGenericStructures,
  planData: null,
  service: supersetFetch,
  slices: SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES.split(','),
  subcountyData: [],
  wardData: null,
};

MDALiteMapReport.defaultProps = defaultProps;
export { MDALiteMapReport };

/** map dispatch to props */
const mapDispatchToProps = {
  fetchJurisdictions: fetchGenericJurisdictions,
  fetchPlans: genericFetchPlans,
  fetchWards: fetchGenericStructures,
};

type DispatchedStateProps = Pick<MDALiteMapProps, 'planData' | 'wardData' | 'subcountyData'>;

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { params } = ownProps.match;
  const { planId, jurisdictionId } = params;
  const planData = planId ? getPlanByIdSelector(state, planId) : null;
  const wardData = getGenericStructures(
    state,
    SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE,
    jurisdictionId,
    planId
  );
  let subcountyData: GenericJurisdiction[] = [];
  if (jurisdictionId) {
    defaultProps.slices.forEach((slice: string) => {
      const jurs = getAllGenericJurisdictionByJurisdictionId(state, slice, jurisdictionId);
      if (jurs.length) {
        const jursOfInterest = jurs.filter(jur => jur.plan_id === planId);
        subcountyData = [...subcountyData, ...jursOfInterest];
      }
    });
  }
  return {
    planData,
    subcountyData,
    wardData,
  };
};

/** Connected MDALiteMapReport component */
const ConnectedMDALiteMapReport = connect(mapStateToProps, mapDispatchToProps)(MDALiteMapReport);

export default ConnectedMDALiteMapReport;
