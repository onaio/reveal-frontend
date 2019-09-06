import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import { SUPERSET_JURISDICTIONS_DATA_SLICE } from '../../../../../configs/env';
import {
  ADMN0_PCODE,
  CountriesAdmin0,
  JurisdictionsByCountry,
} from '../../../../../configs/settings';
import {
  HOME,
  HOME_URL,
  INTERVENTION_IRS_URL,
  IRS_REPORTING_TITLE,
} from '../../../../../constants';
import {
  getAncestorJurisdictionIds,
  getChildrenByParentId,
} from '../../../../../helpers/hierarchy';
import { FlexObject, RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionsById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import { getPlanRecordById, PlanRecord } from '../../../../../store/ducks/plans';
/** register the plans reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** interface to describe props for IrsReport component */
export interface IrsReportProps {
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  jurisdictionsById: { [key: string]: Jurisdiction };
  planById: PlanRecord | null;
  planId: string;
  supersetService: typeof supersetFetch;
}

/** default props for IrsReport component */
export const defaultIrsReportProps: IrsReportProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  jurisdictionsById: {},
  planById: null,
  planId: '',
  supersetService: supersetFetch,
};

export interface IrsReportState {
  childrenByParentId: { [key: string]: string[] };
  country: JurisdictionsByCountry | null;
  filteredJurisdictionIds: string[];
  isLoadingHierarchy: boolean;
  isLoadingPlanData: boolean;
}

export const defaultIrsReportState: IrsReportState = {
  childrenByParentId: {},
  country: null,
  filteredJurisdictionIds: [],
  isLoadingHierarchy: true,
  isLoadingPlanData: false,
};

/** Reporting for Single Active IRS Plan */
class IrsReport extends React.Component<RouteComponentProps<RouteParams> & IrsReportProps, {}> {
  public static defaultProps = defaultIrsReportProps;
  public state = defaultIrsReportState;

  public async componentDidMount() {
    const {
      fetchJurisdictionsActionCreator,
      jurisdictionsById: JurisdictionsById,
      planById,
      supersetService,
    } = this.props;

    // get Jurisdicitons from Store or Superset
    const jurisdictionsArray = Object.keys(JurisdictionsById).length
      ? Object.keys(JurisdictionsById).map(j => JurisdictionsById[j])
      : await supersetService(SUPERSET_JURISDICTIONS_DATA_SLICE, { row_limit: 10000 }).then(
          (jurisdictionResults: FlexObject[] = []) => {
            // GET FULL JURISDICTION HIERARCHY
            const jurArray: Jurisdiction[] = jurisdictionResults
              .map(j => {
                const { id, parent_id, name, geographic_level } = j;
                const jurisdiction: Jurisdiction = {
                  geographic_level: geographic_level || 0,
                  jurisdiction_id: id,
                  name: name || null,
                  parent_id: parent_id || null,
                };
                return jurisdiction;
              })
              .sort((a, b) =>
                a.geographic_level && b.geographic_level
                  ? b.geographic_level - a.geographic_level
                  : 0
              );

            fetchJurisdictionsActionCreator(jurArray);
            return jurArray;
          }
        );

    const jurisdictionsById = Object.keys(JurisdictionsById).length
      ? JurisdictionsById
      : keyBy(jurisdictionsArray, j => j.jurisdiction_id);

    if (planById && planById.plan_jurisdictions_ids) {
      // build and store decendant jurisdictions, jurisdictionsArray MUST be sorted by geographic_level from high to low
      const childrenByParentId = getChildrenByParentId(jurisdictionsArray);

      // define level 0 Jurisdiction as parentlessParent
      const filteredJurisdictionIds = getAncestorJurisdictionIds(
        [...planById.plan_jurisdictions_ids],
        jurisdictionsArray
      );
      const parentlessParentId =
        filteredJurisdictionIds.find(
          a =>
            jurisdictionsById[a] &&
            !jurisdictionsById[a].parent_id &&
            !jurisdictionsById[a].geographic_level
        ) || '';

      // define contry based on parentlessParentId
      const countryPcode: string | undefined = Object.keys(CountriesAdmin0).find(c => {
        const thisCountry: JurisdictionsByCountry = CountriesAdmin0[c as ADMN0_PCODE];
        return thisCountry.jurisdictionId.length
          ? thisCountry.jurisdictionId === parentlessParentId
          : thisCountry.jurisdictionIds.includes(parentlessParentId);
      });
      const country: JurisdictionsByCountry | null =
        CountriesAdmin0[countryPcode as ADMN0_PCODE] || null;

      this.setState({
        childrenByParentId,
        country,
        filteredJurisdictionIds,
        isLoadingHierarchy: false,
      });
    }
  }

  public render() {
    const { planById, planId } = this.props;
    const { isLoadingHierarchy } = this.state;
    // Build Breadcrumbs
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: (planById && planById.plan_title) || 'Loading...',
      },
      pages: [
        homePage,
        {
          label: IRS_REPORTING_TITLE,
          url: INTERVENTION_IRS_URL,
        },
      ],
    };

    if (!planById) {
      return (
        <div className="mb-5">
          <Helmet>
            <title>Plan Not Found</title>
          </Helmet>
          <HeaderBreadcrumbs {...breadCrumbProps} />
          <h2 className="page-title">Loading Plan: {planId}</h2>
          <Loading />
        </div>
      );
    }

    return (
      <div className="mb-5">
        <Helmet>
          <title>IRS Reporting | {planById.plan_title}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <Row>
          <Col>
            <h2 className="page-title">IRS Plan: {planById.plan_title}</h2>
            {isLoadingHierarchy && (
              <div>
                <Loading />
                <div style={{ textAlign: 'center' }}>Loading Location Hierarchy</div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

export { IrsReport };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - props on the component
 * @returns {IrsReportProps}
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): IrsReportProps => {
  const jurisdictionsById = getJurisdictionsById(state);
  const planId = ownProps.match.params.id || '';
  const planById = planId.length ? getPlanRecordById(state, planId) : null;
  const props = {
    jurisdictionsById,
    planById,
    planId,
    ...ownProps,
  };

  return props as IrsReportProps;
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
};

/** Create connected IrsReport */
const ConnectedIrsReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsReport);

export default ConnectedIrsReport;
