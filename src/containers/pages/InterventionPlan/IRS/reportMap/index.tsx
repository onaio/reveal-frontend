import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  HOME,
  HOME_URL,
  INTERVENTION_IRS_URL,
  IRS_REPORTING_TITLE,
  JURISDICTION_ID,
  MAIN_PLAN,
  OPENSRP_LOCATION,
  REPORT_IRS_PLAN_URL,
  STRUCTURE_LAYER,
} from '../../../../../constants';
import {
  FeatureCollection,
  FlexObject,
  RouteParams,
  wrapFeatureCollection,
} from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import supersetFetch from '../../../../../services/superset';

import GeojsonExtent from '@mapbox/geojson-extent';
import { keyBy, keys } from 'lodash';
import { GREEN, GREY } from '../../../../../colors';
import GisidaWrapper, { GisidaProps } from '../../../../../components/GisidaWrapper';
import Loading from '../../../../../components/page/Loading';
import {
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICE,
  SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE,
  SUPERSET_STRUCTURES_SLICE,
  SUPERSET_TASKS_SLICE,
} from '../../../../../configs/env';
import {
  circleLayerConfig,
  extractReportingStructure,
  fillLayerConfig,
  irsReportingCongif,
  lineLayerConfig,
} from '../../../../../configs/settings';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import { getPlanRecordById, PlanRecord } from '../../../../../store/ducks/plans';
import {
  AnyStructure,
  AnyStructureGeojson,
  getStructuresFCByJurisdictionId,
  setStructures,
  Structure,
  StructureGeoJSON,
} from '../../../../../store/ducks/structures';
import tasksReducer, {
  fetchTasks,
  getTasksById,
  getTasksByPlanJurisdictionIds,
  reducerName as tasksReducerName,
  Task,
} from '../../../../../store/ducks/tasks';
import './../../../../../helpers/handlers/handlers.css';

/** register the plans reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(tasksReducerName, tasksReducer);

/** initialize OpenSRP API services */
const OpenSrpLocationService = new OpenSRPService(OPENSRP_LOCATION);

/** interface to describe props for IrsReportMap component */
export interface IrsReportMapProps {
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchStructuresActionCreator: typeof setStructures;
  fetchTasksActionCreator: typeof fetchTasks;
  jurisdictionById: Jurisdiction | null;
  jurisdictionId: string;
  planById: PlanRecord | null;
  planId: string;
  structures: FeatureCollection<StructureGeoJSON> | null;
  tasksById: { [key: string]: Task };
}

/** default props for IrsReportMap component */
export const defaultIrsReportMapProps: IrsReportMapProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchStructuresActionCreator: setStructures,
  fetchTasksActionCreator: fetchTasks,
  jurisdictionById: null,
  jurisdictionId: '',
  planById: null,
  planId: '',
  structures: null,
  tasksById: {},
};

/** Interface to describe IRS Report Map component state */
export interface IrsReportMapState {
  gisidaWrapperProps: GisidaProps | null;
}
/** Interface to describe IRS Report Map component state */
export const defaultIrsReportMapState: IrsReportMapState = {
  gisidaWrapperProps: null,
};

/** Reporting Map for Single Active IRS Plan-Jurisdiction */
class IrsReportMap extends React.Component<
  RouteComponentProps<RouteParams> & IrsReportMapProps,
  {}
> {
  public static defaultProps = defaultIrsReportMapProps;
  public state = defaultIrsReportMapState;

  public async componentDidMount() {
    const {
      fetchJurisdictionsActionCreator,
      fetchStructuresActionCreator,
      fetchTasksActionCreator,
      jurisdictionId,
      planId,
    } = this.props;
    // get jurisdictionById
    const jurisdictionById =
      this.props.jurisdictionById && this.props.jurisdictionById.geojson
        ? { ...this.props.jurisdictionById }
        : await OpenSrpLocationService.read(jurisdictionId, {
            is_jurisdiction: true,
            return_geometry: true,
          }).then(
            (result: any) =>
              ({
                geographic_level: result && result.properties && result.properties.geographicLevel,
                geojson: result && { ...result },
                jurisdiction_id: result && result.id,
                name: result && result.properties && result.properties.name,
                parent_id: result && result.properties && (result.properties.parentId || null),
              } as Jurisdiction)
          );

    // save jurisdictionById to store
    if (
      (!this.props.jurisdictionById || !this.props.jurisdictionById.geojson) &&
      jurisdictionById
    ) {
      fetchJurisdictionsActionCreator([jurisdictionById]);
    }

    /** define superset filter params for jurisdictions */
    const structuresParams = superset.getFormData(3000, [
      { comparator: jurisdictionId, operator: '==', subject: JURISDICTION_ID },
    ]);
    // reference or fetch structures per Jurisdiction
    const structuresArray: AnyStructure[] | null = this.props.structures
      ? null
      : await supersetFetch(SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE, structuresParams)
          .then((structuresResults: FlexObject[]) => {
            // if structures are not returned, return null
            if (
              !structuresResults ||
              !structuresResults.length ||
              !Array.isArray(structuresResults)
            ) {
              return null;
            }

            // if a structureIngester fn is specifed in the configs, use it
            if (
              irsReportingCongif &&
              irsReportingCongif[SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICE]
            ) {
              const { structureIngester } = irsReportingCongif[
                SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICE
              ];
              if (structureIngester) {
                return structuresResults.map(s =>
                  structureIngester(s, SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICE)
                ) as AnyStructure[];
              }
            }

            // fallback to returning resutls as AnyStructre[]
            return structuresResults as AnyStructure[];
          })
          .catch(() => null);

    // save structures to store
    if (!this.props.structures && structuresArray) {
      fetchStructuresActionCreator(structuresArray);
    }
    // define structures feature collection for Gisida Layers
    const structures: FeatureCollection<AnyStructureGeojson> | null =
      this.props.structures ||
      (structuresArray && wrapFeatureCollection(structuresArray.map((s: Structure) => s.geojson)));

    // define params for superset call for plan-location tasks
    const taskParams = superset.getFormData(3000, [
      { comparator: planId, operator: '==', subject: 'plan_id' },
      { comparator: jurisdictionId, operator: '==', subject: JURISDICTION_ID },
    ]);
    // deine tasks relating to this jurisdiction and plan
    const tasksArray = keys(this.props.tasksById).length
      ? keys(this.props.tasksById).map(t => this.props.tasksById[t])
      : await supersetFetch(SUPERSET_TASKS_SLICE, taskParams)
          .then((result: Task[]) => result)
          .catch(() => []);

    // save tasks to store
    if (!keys(this.props.tasksById).length && tasksArray && tasksArray.length) {
      fetchTasksActionCreator(tasksArray);
    }

    // define Gisida Wrapper pros
    const gisidaWrapperProps = this.getGisidaWrapperProps(jurisdictionById, structures);

    this.setState({ gisidaWrapperProps });
  }

  public render() {
    const { jurisdictionById, planById, planId } = this.props;
    const { gisidaWrapperProps } = this.state;
    // Build page-level Breadcrumbs
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: (jurisdictionById && (jurisdictionById.name || 'Village')) || 'Loading...',
      },
      pages: [
        {
          label: HOME,
          url: HOME_URL,
        },
        {
          label: IRS_REPORTING_TITLE,
          url: INTERVENTION_IRS_URL,
        },
        {
          label: (planById && planById.plan_title) || 'Loading...',
          url: `${REPORT_IRS_PLAN_URL}/${planId}`,
        },
      ],
    };

    return (
      <div className="mb-5">
        <Helmet>
          <title>IRS Reporting Map</title>
        </Helmet>
        <Row>
          <Col>
            <HeaderBreadcrumbs {...breadCrumbProps} />
            <h2 className="page-title">
              {(jurisdictionById && jurisdictionById.name) || 'Village'}
            </h2>
          </Col>
        </Row>
        <Row noGutters={true}>
          <Col xs={9}>
            {gisidaWrapperProps ? (
              <div className="map irs-reporting-map">
                <GisidaWrapper {...gisidaWrapperProps} />
              </div>
            ) : (
              <Loading />
            )}
          </Col>
          <Col xs={3}>
            <div className="mapSidebar">
              <h5>Reporting Layers</h5>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  /** getGisidaWrapperProps - GisidaWrapper prop builder building out layers and handlers for Gisida
   * @returns {GisidaProps|null} props object for the GisidaWrapper or null
   */
  private getGisidaWrapperProps(
    jurisdictionById: Jurisdiction,
    structures: FeatureCollection<AnyStructureGeojson> | null
  ): GisidaProps | null {
    if (!jurisdictionById.geojson) {
      return null;
    }
    const layers: FlexObject[] = [];

    // define line layer for Jurisdiction outline
    const jurisdictionLineLayer = {
      ...lineLayerConfig,
      id: `${MAIN_PLAN}-${jurisdictionById.jurisdiction_id}`,
      source: {
        ...lineLayerConfig.source,
        data: {
          ...lineLayerConfig.source.data,
          data: JSON.stringify(jurisdictionById.geojson),
        },
      },
      visible: true,
    };
    layers.push(jurisdictionLineLayer);

    // Define structures layers
    let structuresLayers: FlexObject[] = [];
    if (structures) {
      structuresLayers = this.getDefaultStructuresLayers(structures);
    }

    layers.concat(structuresLayers);

    // define bounds for gisida map position
    const bounds = GeojsonExtent({
      features: [jurisdictionById.geojson],
      type: 'FeatureCollection',
    });

    // define the actual props object for GisidaWrapper
    const gisidaWrapperProps: GisidaProps = {
      bounds,
      geoData: null,
      handlers: [],
      layers,
      pointFeatureCollection: null,
      polygonFeatureCollection: null,
      structures: null,
    };
    return gisidaWrapperProps;
  }

  /** fallback default layer builder for structures layers
   * @param {FeatureCollection<AnyStructureGeojson>} structures - The structures to be used in the layers
   * @returns {FlexObject[]} an array of layers to be used in the GisidaWrapperProps.layers
   */
  private getDefaultStructuresLayers(
    structures: FeatureCollection<AnyStructureGeojson>
  ): FlexObject[] {
    const layers: FlexObject[] = [];
    const layerType = structures.features[0].geometry && structures.features[0].geometry.type;
    const structuresPopup = {
      body: `<div>
        <p class="heading">{{type}}</p>
        <p>Status: {{status}}</p>
      </div>`,
      join: ['jurisdiction_id', 'jurisdiction_id'],
    };

    if (layerType === 'Point') {
      // build circle layers if structures are points
      const structureCircleLayer = {
        ...circleLayerConfig,
        id: `${STRUCTURE_LAYER}-circle`,
        paint: {
          ...circleLayerConfig.paint,
          'circle-color': GREEN,
          'circle-stroke-color': GREEN,
          'circle-stroke-opacity': 1,
        },
        popup: structuresPopup,
        source: {
          ...circleLayerConfig.source,
          data: {
            data: JSON.stringify(structures),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        visible: true,
      };
      layers.push(structureCircleLayer);
    } else {
      // build fill / line layers if structures are polygons
      const structuresFillLayer = {
        ...fillLayerConfig,
        id: `${STRUCTURE_LAYER}-fill`,
        paint: {
          ...fillLayerConfig.paint,
          'fill-color': GREY,
          'fill-outline-color': GREY,
        },
        popup: structuresPopup,
        source: {
          ...fillLayerConfig.source,
          data: {
            ...fillLayerConfig.source.data,
            data: JSON.stringify(structures),
          },
        },
        visible: true,
      };
      layers.push(structuresFillLayer);

      const structuresLineLayer = {
        ...lineLayerConfig,
        id: `${STRUCTURE_LAYER}-line`,
        paint: {
          'line-color': GREY,
          'line-opacity': 1,
          'line-width': 2,
        },
        source: {
          ...lineLayerConfig.source,
          data: {
            ...lineLayerConfig.source.data,
            data: JSON.stringify(structures),
          },
        },
      };
      layers.push(structuresLineLayer);
    }
    return layers;
  }
}

export { IrsReportMap };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - props on the component
 * @returns {IrsReportMapProps}
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): IrsReportMapProps => {
  const jurisdictionId = ownProps.match.params.jurisdictionId || '';
  const jurisdictionById = getJurisdictionById(state, jurisdictionId);
  const planId = ownProps.match.params.id || '';
  const planById = planId.length ? getPlanRecordById(state, planId) : null;
  const structures = getStructuresFCByJurisdictionId(state, jurisdictionId);
  const tasksArray: Task[] = getTasksByPlanJurisdictionIds(state, planId, jurisdictionId) || [];
  const props = {
    jurisdictionById,
    jurisdictionId,
    planById,
    planId,
    structures: structures.features.length ? structures : null,
    tasksById: keyBy(tasksArray, t => t.task_identifier) as { [key: string]: Task },
    ...ownProps,
  };
  return props as IrsReportMapProps;
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchStructuresActionCreator: setStructures,
  fetchTasksActionCreator: fetchTasks,
};
/** Create connected IrsReportMap */
const ConnectedIrsReportMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsReportMap);

export default ConnectedIrsReportMap;
