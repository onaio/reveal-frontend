// this is the IRS Plan page component
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Column } from 'react-table';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';

import DrillDownTable, { DrillDownProps, DropDownCell } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';

import {
  SUPERSET_JURISDICTIONS_DATA_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE,
  SUPERSET_PLANS_TABLE_SLICE,
} from '../../../../../configs/env';
import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../../constants';
import { FlexObject, RouteParams } from '../../../../../helpers/utils';

import supersetFetch from '../../../../../services/superset';

import jurisdictionReducer, {
  fetchAllJurisdictionIds,
  fetchJurisdictions,
  getAllJurisdictionsIdArray,
  getJurisdictionsArray,
  getJurisdictionsIdArray,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import plansReducer, {
  fetchPlanRecords,
  getPlanRecordById,
  PlanRecord,
  PlanRecordResponse,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

import { strict } from 'assert';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** IrsPlanProps - interface for IRS Plan page */
export interface IrsPlanProps {
  allJurisdictionIds: string[];
  fetchAllJurisdictionIdsActionCreator: typeof fetchAllJurisdictionIds;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlanRecords;
  isDraftPlan?: boolean;
  isFinalizedPlan?: boolean;
  isNewPlan?: boolean;
  jurisdictionsArray: Jurisdiction[];
  loadedJurisdictionIds: string[];
  planById?: PlanRecord | null;
  planId: string | null;
  supersetService: typeof supersetFetch;
}

/** defaultIrsPlanProps - default props for IRS Plan page */
export const defaultIrsPlanProps: IrsPlanProps = {
  allJurisdictionIds: [],
  fetchAllJurisdictionIdsActionCreator: fetchAllJurisdictionIds,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlanRecords,
  isDraftPlan: false,
  isFinalizedPlan: false,
  isNewPlan: false,
  jurisdictionsArray: [],
  loadedJurisdictionIds: [],
  planById: null,
  planId: null,
  supersetService: supersetFetch,
};

/** IrsPlan - component for IRS Plan page */
class IrsPlan extends React.Component<RouteComponentProps<RouteParams> & IrsPlanProps, {}> {
  public static defaultProps = defaultIrsPlanProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlanProps) {
    super(props);
  }

  public async componentDidMount() {
    const {
      allJurisdictionIds,
      fetchAllJurisdictionIdsActionCreator,
      fetchJurisdictionsActionCreator,
      fetchPlansActionCreator,
      isFinalizedPlan,
      loadedJurisdictionIds,
      planId,
      planById,
      supersetService,
    } = this.props;

    // GET LIST OF ALL JURISDICTIONS
    let allJurIds: string[] = [];
    if (!allJurisdictionIds.length || allJurisdictionIds.length === loadedJurisdictionIds.length) {
      // todo - is there a better way to fetch a list of ALL jurisdiction ids?
      await supersetFetch(SUPERSET_JURISDICTIONS_DATA_SLICE, { row_limit: 3000 }).then(result => {
        // populate array of unique `id`s
        if (result && result.length) {
          for (const j of result) {
            if (allJurIds.indexOf(j.id) === -1) {
              allJurIds.push(j.id);
            }
          }
        }
        return fetchAllJurisdictionIdsActionCreator([...allJurIds]);
      });
    } else {
      allJurIds = [...allJurisdictionIds];
    }

    // GET PLAN
    if (planId && !planById) {
      const planSupersetParams = superset.getFormData(10, [
        { comparator: planId, operator: '==', subject: 'identifier' },
      ]);
      await supersetService(SUPERSET_PLANS_TABLE_SLICE, planSupersetParams).then(
        (planResult: PlanRecordResponse[]) => fetchPlansActionCreator(planResult)
      );
    }

    // GET PLAN JURISDICTIONS associated with this plan
    let planJurisdictionIdsToGet: string[] = [];
    let otherJurisdictionIdsToGet: string[] = [];
    if (planId && isFinalizedPlan) {
      const pivotParams = superset.getFormData(500, [
        { comparator: planId, operator: '==', subject: 'plan_id' },
      ]);
      await supersetService(SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE, pivotParams).then(
        relevantJuridictions => {
          if (!relevantJuridictions) {
            return new Promise((resolve, reject) => reject());
          }

          // define jurisdictions not in the store
          planJurisdictionIdsToGet = relevantJuridictions
            .map((j: any) =>
              !loadedJurisdictionIds.includes(j.jurisdiction_id) ? j.jurisdiction_id : null
            )
            .filter((j: string | null) => j && strict.length);

          if (!planJurisdictionIdsToGet.length) {
            return new Promise(resolve => resolve());
          }

          // build superset adhoc filter expression
          let sqlFilterExpression = '';
          for (let i = 0; i < planJurisdictionIdsToGet.length; i += 1) {
            const jurId = planJurisdictionIdsToGet[i];
            if (i) {
              sqlFilterExpression += ' OR ';
            }
            sqlFilterExpression += `jurisdiction_id = '${jurId}'`;
          }

          // define superset params for
          const planJurisdictionSupersetParams = superset.getFormData(1000, [
            { sqlExpression: sqlFilterExpression },
          ]);

          return supersetService(SUPERSET_JURISDICTIONS_SLICE, planJurisdictionSupersetParams).then(
            (jurisdictionResults: Jurisdiction[]) =>
              fetchJurisdictionsActionCreator(jurisdictionResults)
          );
        }
      );
    }

    // GET REMAINING JURISDICTIONS
    if (!isFinalizedPlan) {
      let sqlFilterExpression = '';
      let idsToUse: string[] = [];
      if (loadedJurisdictionIds.length || planJurisdictionIdsToGet.length) {
        otherJurisdictionIdsToGet = allJurIds.filter((j: string) => {
          return !loadedJurisdictionIds.includes(j) && !planJurisdictionIdsToGet.includes(j);
        });

        const otherJurisdictionIdsNotToGet = Array.from(
          new Set([...planJurisdictionIdsToGet, ...loadedJurisdictionIds])
        );

        const doInclude = otherJurisdictionIdsToGet.length < otherJurisdictionIdsNotToGet.length;
        idsToUse = doInclude ? otherJurisdictionIdsToGet : otherJurisdictionIdsNotToGet;

        // build query params
        for (let i = 0; i < idsToUse.length; i += 1) {
          const jurId = idsToUse[i];
          if (i) {
            sqlFilterExpression += doInclude ? ' OR ' : ' AND ';
          }
          sqlFilterExpression += `id ${doInclude ? '=' : '!='} '${jurId}'`;
        }
      }

      const otherJurisdictionSupersetParams = sqlFilterExpression.length
        ? superset.getFormData(3000, [{ sqlExpression: sqlFilterExpression }])
        : { row_limit: 3000 };

      supersetService(SUPERSET_JURISDICTIONS_DATA_SLICE, otherJurisdictionSupersetParams).then(
        (jurisdictionResults: FlexObject[] = []) => {
          const jurisdictions = jurisdictionResults.map(j => {
            const { id, parent_id, name, geographic_level } = j;
            const jurisdiction: Jurisdiction = {
              geographic_level: geographic_level || 0,
              jurisdiction_id: id,
              name: name || null,
              parent_id: parent_id || null,
            };
            return jurisdiction;
          });
          return fetchJurisdictionsActionCreator(jurisdictions);
        }
      );
    }
  }

  public render() {
    const { planId, planById, isDraftPlan, isFinalizedPlan } = this.props;
    if (planId && !planById) {
      return <Loading />;
    }

    const pageLabel =
      (isFinalizedPlan && planById && planById.plan_title) ||
      (isDraftPlan && planById && `${planById.plan_title} (draft)`) ||
      'New Plan';

    const breadCrumbProps = this.getBreadCrumbProps(this.props, pageLabel);

    let planTableProps: DrillDownProps<any> | null; // todo - type with DrillDownProps
    if (isFinalizedPlan) {
      planTableProps = this.getFinalizedPlanTableProps(this.props);
    } else {
      planTableProps = this.getDrilldownPlanTableProps(this.props);
    }

    return (
      <div className="mb-5">
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <Row>
          <Col>
            <h2 className="page-title">IRS: {pageLabel}</h2>
            {/* rename button will go here */}
          </Col>
          {/* <Col>Save / finalize buttons will go here</Col> */}
        </Row>

        {/* <Row><Col>Map will go here!</Col></Row> */}

        {/* Section for table of jurisdictions */}
        {planTableProps && (
          <Row>
            <Col>
              <h3>Jurisdictions</h3>
              <DrillDownTable {...planTableProps} />
            </Col>
          </Row>
        )}
      </div>
    );
  }

  /** getDrilldownPlanTableProps - getter for hierarchical DrilldownTable props
   * @param props - component props
   * @returns tableProps|null - compatible object for DrillDownTable props
   */
  private getDrilldownPlanTableProps(props: IrsPlanProps) {
    const { jurisdictionsArray } = props;
    if (!jurisdictionsArray.length) {
      return null;
    }

    const jurisdictionData = jurisdictionsArray.map((j: Jurisdiction) =>
      j.geojson
        ? {
            ...j.geojson.properties,
          }
        : {
            ...{ id: j.jurisdiction_id },
            ...j,
          }
    );

    // to do - add checkmark selection column
    // to do - add checkmark selection event handler
    // to do - add selection object to component state
    // to do - make Name column clickable

    const tableProps: DrillDownProps<any> = {
      CellComponent: DropDownCell,
      data: [...jurisdictionData],
      identifierField: 'jurisdiction_id',
      linkerField: 'name',
      minRows: 0,
      parentIdentifierField: 'parent_id',
      rootParentId: null,
      showPagination: false,
      useDrillDownTrProps: true,
    };
    return tableProps;
  }

  /** getFinalizedPlanTableProps - getter for (flat) DrilldownTable props
   * @param props - component props
   * @returns tableProps|null - compatible object for DrillDownTable props
   */
  private getFinalizedPlanTableProps(props: IrsPlanProps) {
    const { jurisdictionsArray } = props;
    if (!jurisdictionsArray.length) {
      return null;
    }
    const jurisdictionData = jurisdictionsArray.map((j: Jurisdiction) =>
      j.geojson
        ? {
            ...j.geojson.properties,
          }
        : {
            id: j.jurisdiction_id,
            jurisdiction_name: j.name,
            parent_id: '',
          }
    );
    const columns: Column[] = [
      {
        Header: 'Name',
        columns: [
          {
            Header: '',
            accessor: 'jurisdiction_name',
          },
        ],
      },
      {
        Header: 'Teams Assigned',
        columns: [
          {
            Header: '',
            accessor: () => <span className="text-info">None assigned</span>,
            id: 'teams_assigned',
          },
        ],
      },
    ];

    const tableProps: DrillDownProps<any> = {
      CellComponent: DropDownCell,
      columns,
      data: [...jurisdictionData],
      identifierField: 'jurisdiction_id',
      linkerField: 'jurisdiction_name',
      minRows: 0,
      parentIdentifierField: 'parent_id',
      rootParentId: null,
      showPageSizeOptions: false,
      showPagination: false,
      useDrillDownTrProps: true,
    };
    return tableProps;
  }

  /** getBreadCrumbProps - get properties for HeaderBreadcrumbs component
   * @param props - component props
   * @param pageLabel - string for the current page lable
   * @returns breadCrumbProps - compatible object for HeaderBreadcrumbs props
   */
  private getBreadCrumbProps(props: IrsPlanProps, pageLabel: string) {
    const { isDraftPlan, isFinalizedPlan, planId } = props;
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const basePage = {
      label: 'IRS',
      url: INTERVENTION_IRS_URL,
    };
    const urlPathAppend =
      (isFinalizedPlan && `plan/${planId}`) || (isDraftPlan && `draft/${planId}`) || 'new';
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: pageLabel,
        url: `${INTERVENTION_IRS_URL}/${urlPathAppend}`,
      },
      pages: [homePage, basePage],
    };
    return breadCrumbProps;
  }
}

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  planId: string | null;
}

export { IrsPlan };

const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId = ownProps.match.params.id || null;
  const plan = getPlanRecordById(state, planId);
  const isNewPlan = planId === null;
  const isDraftPlan = plan && plan.plan_status !== 'active';
  const isFinalizedPlan = plan && plan.plan_status === 'active';

  const allJurisdictionIds = getAllJurisdictionsIdArray(state);
  const jurisdictionsArray = getJurisdictionsArray(state);
  const loadedJurisdictionIds = getJurisdictionsIdArray(state);

  const props = {
    allJurisdictionIds,
    isDraftPlan,
    isFinalizedPlan,
    isNewPlan,
    jurisdictionsArray,
    loadedJurisdictionIds,
    planById: plan,
    planId,
    ...ownProps,
  };
  return props;
};

const mapDispatchToProps = {
  fetchAllJurisdictionIdsActionCreator: fetchAllJurisdictionIds,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlanRecords,
};

const ConnectedIrsPlan = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlan);

export default ConnectedIrsPlan;
