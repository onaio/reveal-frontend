// this is the IRS Plan page component
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Column } from 'react-table';
import { Button, Col, Input, InputGroup, InputGroupAddon, Row } from 'reactstrap';
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
import {
  ADMN0_PCODE,
  CountriesAdmin0,
  JurisdictionsByCountry,
} from './../../../../../configs/settings';

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
  InterventionStatus,
  InterventionType,
  PlanRecord,
  PlanRecordResponse,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

import { strict } from 'assert';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';

import './style.css';

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

interface IrsPlanState {
  filteredJurisdictions: Jurisdiction[];
  isEditingPlanName: boolean;
  isSelectingCountry: boolean;
  newPlan: null | PlanRecord;
  previousPlanName: string;
}

/** IrsPlan - component for IRS Plan page */
class IrsPlan extends React.Component<
  RouteComponentProps<RouteParams> & IrsPlanProps,
  IrsPlanState
> {
  public static defaultProps = defaultIrsPlanProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlanProps) {
    super(props);
    this.state = {
      filteredJurisdictions: [],
      isEditingPlanName: false,
      isSelectingCountry: props.isNewPlan || false,
      newPlan: props.isNewPlan
        ? {
            id: '',
            plan_effective_period_end: '',
            plan_effective_period_start: '',
            plan_fi_reason: '',
            plan_fi_status: '',
            plan_id: '',
            plan_intervention_type: InterventionType.IRS,
            plan_jurisdictions_ids: [],
            plan_status: 'new',
            plan_title: this.getNewPlanTitle(),
            plan_version: '',
          }
        : null,
      previousPlanName: '',
    };
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
    const { planId, planById, isDraftPlan, isFinalizedPlan, isNewPlan } = this.props;
    const { newPlan, isEditingPlanName, isSelectingCountry } = this.state;
    if ((planId && !planById) || (isNewPlan && !newPlan)) {
      return <Loading />;
    }

    const pageLabel =
      (isFinalizedPlan && planById && planById.plan_title) ||
      (isDraftPlan && planById && `${planById.plan_title} (draft)`) ||
      (newPlan && newPlan.plan_title) ||
      'New Plan';

    const breadCrumbProps = this.getBreadCrumbProps(this.props, pageLabel);

    let planTableProps: DrillDownProps<any> | null; // todo - type with DrillDownProps
    if (isFinalizedPlan) {
      planTableProps = this.getFinalizedPlanTableProps(this.props);
    } else {
      planTableProps = this.getDrilldownPlanTableProps(this.state);
    }

    const onEditNameButtonClick = (e: any) => {
      this.onEditNameButtonClick(e);
    };
    const onEditNameInputChange = (e: any) => {
      this.onEditNameInputChange(e);
    };
    const onCancleEditNameButtonClick = (e: any) => {
      this.onCancleEditNameButtonClick(e);
    };
    const onSaveEditNameButtonClick = (e: any) => {
      this.onSaveEditNameButtonClick(e);
    };

    const onSelectCountryChange = (e: any) => {
      this.onSelectCountryChange(e);
    };

    const planHeaderRow = (
      <Row>
        {isFinalizedPlan && (
          <Col>
            <h2 className="page-title">IRS: {pageLabel}</h2>
          </Col>
        )}
        {!isFinalizedPlan && !isEditingPlanName && (
          <Col>
            <h2 className="page-title">IRS: {pageLabel}</h2>
            <Button color="link" onClick={onEditNameButtonClick}>
              edit
            </Button>
          </Col>
        )}
        {!isFinalizedPlan && newPlan && isEditingPlanName && (
          <Col>
            <h2 className="page-title edit">IRS:</h2>
            <InputGroup className="edit-plan-title-input-group">
              <Input
                id="edit-plan-title-input"
                name="edit-plan-title-input"
                onChange={onEditNameInputChange}
                placeholder={newPlan.plan_title}
              />
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={onCancleEditNameButtonClick}>
                  cancel
                </Button>
              </InputGroupAddon>
              <InputGroupAddon addonType="append">
                <Button color="primary" onClick={onSaveEditNameButtonClick}>
                  save
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Col>
        )}
        {/* <Col>Save / finalize buttons will go here</Col> */}
      </Row>
    );

    if (isSelectingCountry) {
      return (
        <div className="mb-5">
          <HeaderBreadcrumbs {...breadCrumbProps} />
          {planHeaderRow}
          <Row>
            <Col>
              <Input
                id="select-plan-country"
                name="select-plan-country"
                onChange={onSelectCountryChange}
                type="select"
              >
                <option>Choose a Country</option>
                <option value="TH">Thailand</option>
                <option value="ZM">Zambia</option>
              </Input>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <div className="mb-5">
        <HeaderBreadcrumbs {...breadCrumbProps} />
        {planHeaderRow}
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

  private getDecendantJurisdictionIds(
    ParentIds: string[],
    jurisdictionsArray: Jurisdiction[],
    doIncludeParentIds: boolean = true
  ): string[] {
    const decendantIds: string[] = [];
    const parentIds: string[] = [...ParentIds];

    while (parentIds.length) {
      const parentId = parentIds.shift() as string;
      if (ParentIds.indexOf(parentId) === -1 || doIncludeParentIds) {
        decendantIds.push(parentId);
      }

      for (const jurisdiction of jurisdictionsArray) {
        if (jurisdiction.parent_id === parentId) {
          parentIds.push(jurisdiction.jurisdiction_id);
        }
      }
    }

    return decendantIds;
  }

  private onSelectCountryChange(e: any) {
    if (!e || !e.target || !(e.target.value as ADMN0_PCODE)) {
      return false;
    }
    const { jurisdictionsArray } = this.props;
    const country: JurisdictionsByCountry = CountriesAdmin0[e.target.value as ADMN0_PCODE];

    const jurisdictionsToInclude = this.getDecendantJurisdictionIds(
      country.jurisdictionIds,
      jurisdictionsArray
    );

    const filteredJurisdictions: Jurisdiction[] = jurisdictionsArray.filter(
      (jurisdiction: Jurisdiction) =>
        jurisdictionsToInclude.indexOf(jurisdiction.jurisdiction_id) !== -1
    );

    const { newPlan: NewPlan } = this.state;
    const newPlan: PlanRecord | null = NewPlan
      ? {
          ...NewPlan,
          plan_jurisdictions_ids: [...jurisdictionsToInclude],
        }
      : NewPlan;

    this.setState({
      filteredJurisdictions,
      isSelectingCountry: false,
      newPlan,
    });
  }
  private getNewPlanTitle() {
    const date = new Date();
    return `${InterventionType.IRS}_${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
  }

  private onEditNameButtonClick(e: any) {
    e.preventDefault();
    if (this.state.newPlan) {
      this.setState({
        isEditingPlanName: true,
        previousPlanName: this.state.newPlan.plan_title,
      });
    }
  }

  private onEditNameInputChange(e: any) {
    const { newPlan: NewPlan } = this.state;
    if (NewPlan) {
      const newPlan: PlanRecord = {
        ...NewPlan,
        plan_title: e.target.value,
      };
      this.setState({ newPlan });
    }
  }

  private onCancleEditNameButtonClick(e: any) {
    e.preventDefault();
    const { newPlan: NewPlan, previousPlanName } = this.state;
    if (NewPlan) {
      const newPlan: PlanRecord = {
        ...NewPlan,
        plan_title: previousPlanName,
      };
      this.setState({
        isEditingPlanName: false,
        newPlan,
        previousPlanName: '',
      });
    }
  }

  private onSaveEditNameButtonClick(e: any) {
    e.preventDefault();
    this.setState({
      isEditingPlanName: false,
      previousPlanName: '',
    });
  }

  /** getDrilldownPlanTableProps - getter for hierarchical DrilldownTable props
   * @param props - component props
   * @returns tableProps|null - compatible object for DrillDownTable props
   */
  private getDrilldownPlanTableProps(state: IrsPlanState) {
    const { filteredJurisdictions } = state;
    if (!filteredJurisdictions.length) {
      return null;
    }

    const jurisdictionData = filteredJurisdictions.map((j: Jurisdiction) =>
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
      minRows: 0,
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
      linkerField: 'jurisdiction_name',
      minRows: 0,
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
