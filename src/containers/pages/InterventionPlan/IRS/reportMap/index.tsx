import reducerRegistry from '@onaio/redux-reducer-registry';
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
  MAIN_PLAN,
  OPENSRP_LOCATION,
  REPORT_IRS_PLAN_URL,
} from '../../../../../constants';
import { FlexObject, RouteParams } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';

import GeojsonExtent from '@mapbox/geojson-extent';
import GisidaWrapper, { GisidaProps } from '../../../../../components/GisidaWrapper';
import Loading from '../../../../../components/page/Loading';
import { lineLayerConfig } from '../../../../../configs/settings';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import { getPlanRecordById, PlanRecord } from '../../../../../store/ducks/plans';
/** register the plans reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** initialize OpenSRP API services */
const OpenSrpLocationService = new OpenSRPService(OPENSRP_LOCATION);

/** interface to describe props for IrsReportMap component */
export interface IrsReportMapProps {
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  jurisdictionById: Jurisdiction | null;
  jurisdictionId: string;
  planById: PlanRecord | null;
  planId: string;
}

/** default props for IrsReportMap component */
export const defaultIrsReportMapProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  jurisdictionById: null,
  jurisdictionId: '',
  planById: null,
  planId: '',
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
    const { fetchJurisdictionsActionCreator, jurisdictionId } = this.props;
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
                name: result && result.name,
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

    const gisidaWrapperProps = this.getGisidaWrapperProps(jurisdictionById);
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
        <Row>
          <Col>
            {gisidaWrapperProps ? (
              <div className="map irs-plan-map">
                <GisidaWrapper {...gisidaWrapperProps} />
              </div>
            ) : (
              <Loading />
            )}
          </Col>
        </Row>
      </div>
    );
  }

  /** getGisidaWrapperProps - GisidaWrapper prop builder building out layers and handlers for Gisida
   * @returns {GisidaProps|null} props object for the GisidaWrapper or null
   */
  private getGisidaWrapperProps(jurisdictionById: Jurisdiction) {
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
  const props = {
    jurisdictionById,
    jurisdictionId,
    planById,
    planId,
    ...ownProps,
  };
  return props as IrsReportMapProps;
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
};
/** Create connected IrsReportMap */
const ConnectedIrsReportMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsReportMap);

export default ConnectedIrsReportMap;
