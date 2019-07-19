// this is the IRS Plan page component
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Column } from 'react-table';
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Row,
} from 'reactstrap';
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
  InterventionType,
  PlanRecord,
  PlanRecordResponse,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

import { strict } from 'assert';
import { Helmet } from 'react-helmet';
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

interface TableCrumb {
  label: string;
  id: string | null;
  active: boolean;
}

interface IrsPlanState {
  doRenderTable: boolean;
  filteredJurisdictions: Jurisdiction[];
  focusJurisdictionId: string | null;
  isEditingPlanName: boolean;
  isStartingPlan: boolean;
  newPlan: PlanRecord | null;
  planCountry: string;
  previousPlanName: string;
  tableCrumbs: TableCrumb[];
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
      doRenderTable: true,
      filteredJurisdictions: [],
      focusJurisdictionId: null,
      isEditingPlanName: false,
      isStartingPlan: props.isNewPlan || false,
      newPlan: props.isNewPlan
        ? {
            id: '',
            plan_date: this.getNewPlanDate(),
            plan_effective_period_end: '',
            plan_effective_period_start: '',
            plan_fi_reason: '',
            plan_fi_status: '',
            plan_id: '',
            plan_intervention_type: InterventionType.IRS,
            plan_jurisdictions_ids: [],
            plan_status: PlanStatus.NEW,
            plan_title: this.getNewPlanTitle(),
            plan_version: '',
          }
        : null,
      planCountry: '',
      previousPlanName: '',
      tableCrumbs: [],
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
    const {
      planCountry,
      doRenderTable,
      tableCrumbs,
      newPlan,
      isEditingPlanName,
      isStartingPlan,
    } = this.state;
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

    const onSetPlanNameChange = (e: any) => {
      this.onSetPlanNameChange(e);
    };
    const onSetPlanStartDateChange = (e: any) => {
      this.onSetPlanStartDateChange(e);
    };
    const onSetPlanEndDateChange = (e: any) => {
      this.onSetPlanEndDateChange(e);
    };
    const onSelectCountryChange = (e: any) => {
      this.onSelectCountryChange(e);
    };
    const onStartPlanFormSubmit = (e: any) => {
      this.onStartPlanFormSubmit(e);
    };

    if (isStartingPlan && newPlan) {
      const { plan_effective_period_end, plan_effective_period_start, plan_title } = newPlan;
      return (
        <div className="mb-5">
          <HeaderBreadcrumbs {...breadCrumbProps} />
          <Row>
            <Col>
              <h2 className="page-title">New IRS Plan</h2>
              <hr />
            </Col>
          </Row>
          <Row>
            <Col xs="6">
              <Form>
                <FormGroup>
                  <Label for="set-plan-name">Plan Name</Label>
                  <Input
                    id="set-plan-name"
                    onChange={onSetPlanNameChange}
                    placeholder={plan_title}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="set-plan-start-date">Start Date</Label>
                  <Input
                    id="set-plan-start-date"
                    onChange={onSetPlanStartDateChange}
                    defaultValue={plan_effective_period_start}
                    type="date"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="set-plan-end-date">End Date</Label>
                  <Input
                    id="set-plan-end-date"
                    onChange={onSetPlanEndDateChange}
                    defaultValue={plan_effective_period_end}
                    type="date"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="select-plan-country">Select a Country</Label>
                  <Input
                    id="select-plan-country"
                    defaultValue={planCountry}
                    name="select-plan-country"
                    onChange={onSelectCountryChange}
                    type="select"
                  >
                    <option>...</option>
                    <option value="TH">Thailand</option>
                    <option value="ZM">Zambia</option>
                  </Input>
                </FormGroup>
                <Button
                  color="primary"
                  disabled={
                    !newPlan.plan_effective_period_end.length ||
                    !newPlan.plan_effective_period_start.length ||
                    !planCountry.length
                  }
                  onClick={onStartPlanFormSubmit}
                >
                  Select Jurisdictions
                </Button>
              </Form>
            </Col>
          </Row>
        </div>
      );
    }

    const onEditNameButtonClick = (e: any) => {
      this.onEditNameButtonClick(e);
    };
    const onCancleEditNameButtonClick = (e: any) => {
      this.onCancleEditNameButtonClick(e);
    };
    const onEditNameInputChange = (e: any) => {
      this.onEditNameInputChange(e);
    };
    const onSaveEditNameButtonClick = (e: any) => {
      this.onSaveEditNameButtonClick(e);
    };
    const onEditPlanSettingsButtonClick = (e: any) => {
      this.onEditPlanSettingsButtonClick(e);
    };

    const planHeaderRow = (
      <Row>
        {isFinalizedPlan && (
          <Col className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
            <hr />
          </Col>
        )}
        {!isFinalizedPlan && !isEditingPlanName && (
          <Col className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
            <Button color="link" onClick={onEditNameButtonClick}>
              edit
            </Button>
            <hr />
          </Col>
        )}
        {!isFinalizedPlan && newPlan && isEditingPlanName && (
          <Col className="page-title-col">
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
              <Button color="link" onClick={onEditPlanSettingsButtonClick}>
                Plan settings...
              </Button>
            </InputGroup>
            <hr />
          </Col>
        )}
        {/* <Col>Save / finalize buttons will go here</Col> */}
      </Row>
    );

    const onTableBreadCrumbClick = (e: any) => {
      this.onTableBreadCrumbClick(e);
    };
    const tableBreadCrumbs = (
      <ol className="table-bread-crumbs breadcrumb">
        {this.state.tableCrumbs.map((crumb, i) => {
          const { active, id, label } = crumb;
          return (
            <li key={i} className="breadcrumb-item">
              {active ? (
                label
              ) : (
                <a
                  className={`table-bread-crumb-link`}
                  href=""
                  id={id || 'null'}
                  onClick={onTableBreadCrumbClick}
                >
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    );

    return (
      <div className="mb-5">
        <Helmet>
          <title>IRS: {pageLabel}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        {planHeaderRow}
        {/* <Row><Col>Map will go here!</Col></Row> */}

        {/* Section for table of jurisdictions */}
        {planTableProps && (
          <Row>
            <Col>
              <h3 className="table-title">Jurisdictions</h3>
              {tableCrumbs.length && tableBreadCrumbs}
              {doRenderTable && <DrillDownTable {...planTableProps} />}
            </Col>
          </Row>
        )}
      </div>
    );
  }

  // Jurisdiction Hierarchy Control
  private onTableBreadCrumbClick = (e: any) => {
    e.preventDefault();
    if (e && e.target && e.target.id) {
      this.onResetDrilldownTableHierarchy(e.target.id);
    }
  };

  private onResetDrilldownTableHierarchy(Id: string | null) {
    const id = Id !== 'null' ? Id : null;
    const { tableCrumbs } = this.state;
    const nextActiveCrumbIndex = tableCrumbs.map(c => c.id).indexOf(id) + 1;
    const nextCrumbs = [...tableCrumbs];
    nextCrumbs.splice(nextActiveCrumbIndex);
    nextCrumbs[nextCrumbs.length - 1].active = true;

    this.setState(
      {
        doRenderTable: false,
        focusJurisdictionId: id,
        tableCrumbs: nextCrumbs,
      },
      () => {
        this.setState({
          doRenderTable: true,
        });
      }
    );
  }

  private onDrilldownClick(id: string) {
    const { tableCrumbs } = this.state;
    const { jurisdictionsArray } = this.props;

    let newCrumb: TableCrumb | null = null;
    for (const j of jurisdictionsArray) {
      if (j.jurisdiction_id === id) {
        newCrumb = {
          active: true,
          id,
          label: j.name || 'Jurisdiction',
        };
        break;
      }
    }

    const newCrumbs: TableCrumb[] = tableCrumbs.map(c => ({
      ...c,
      active: false,
    }));

    if (newCrumb) {
      this.setState({
        focusJurisdictionId: (id as string) || null,
        tableCrumbs: [...newCrumbs, newCrumb],
      });
    }
  }

  // Plan Title Control
  private getNewPlanDate(): string {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  private getNewPlanTitle(): string {
    const date = this.getNewPlanDate();
    return `${InterventionType.IRS}_${date}`;
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
  private onEditPlanSettingsButtonClick(e: any) {
    if (!this.props.isFinalizedPlan) {
      this.setState({ isStartingPlan: true });
    }
  }

  // new plan form handlers
  private onSetPlanNameChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_title: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  private onSetPlanStartDateChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_effective_period_start: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  private onSetPlanEndDateChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_effective_period_end: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  private onSelectCountryChange(e: any) {
    if (e && e.target && (e.target.value as ADMN0_PCODE)) {
      this.setState({ planCountry: e.target.value });
    }
  }
  private onStartPlanFormSubmit(e: any) {
    const { planCountry } = this.state;
    const { jurisdictionsArray } = this.props;
    const country: JurisdictionsByCountry = CountriesAdmin0[planCountry as ADMN0_PCODE];

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

    const tableCrumbs: TableCrumb[] = [
      {
        active: true,
        id: null,
        label: country.ADMN0_EN,
      },
    ];

    this.setState({
      filteredJurisdictions,
      isStartingPlan: false,
      newPlan,
      tableCrumbs,
    });
  }

  // Jurisdiction Selection Control
  private onToggleJurisdictionSelection(id: string, isSelected: boolean) {
    const { newPlan: NewPlan, filteredJurisdictions } = this.state;
    if (NewPlan && NewPlan.plan_jurisdictions_ids && filteredJurisdictions.length) {
      const newPlanJurisdictionIds = [...NewPlan.plan_jurisdictions_ids];

      // define child jurisdictions of clicked jurisdiction
      const jurisdictionIdsToToggle = this.getDecendantJurisdictionIds([id], filteredJurisdictions);

      // loop through all child jurisdictions
      for (const jurisdictionId of jurisdictionIdsToToggle) {
        // if checked and not in plan_jurisdictions_ids, add it
        if (!newPlanJurisdictionIds.includes(jurisdictionId)) {
          newPlanJurisdictionIds.push(jurisdictionId);
          // if not checked and in plan_jurisdictions_ids, remove it
        } else {
          newPlanJurisdictionIds.splice(newPlanJurisdictionIds.indexOf(jurisdictionId), 1);
        }
      }

      // define newPlan with newPlanJurisdictionIds, set state
      const newPlan: PlanRecord = {
        ...NewPlan,
        plan_jurisdictions_ids: [...newPlanJurisdictionIds],
      };
      this.setState({ newPlan });
    }
  }

  private onTableCheckboxChange(e: any) {
    if (e && e.target) {
      const { value: id, checked: isSelected } = e.target;
      this.onToggleJurisdictionSelection(id, isSelected);
    }
  }

  private onToggleAllCheckboxChange(e: any) {
    const { newPlan: NewPlan, filteredJurisdictions } = this.state;
    if (e && e.target && NewPlan) {
      const { checked: isSelected } = e.target;
      const newPlanJurisdictionIds: string[] = isSelected
        ? filteredJurisdictions.map((j: Jurisdiction) => j.jurisdiction_id)
        : [];
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_jurisdictions_ids: [...newPlanJurisdictionIds],
      };
      this.setState({ newPlan });
    }
  }

  // Getter methods
  private getParentJurisdiction(id: string): Jurisdiction | null {
    const { jurisdictionsArray } = this.props;
    let childJurisdiction: Jurisdiction | null = null;

    // identify child jurisdiction
    for (const c of jurisdictionsArray) {
      if (c.jurisdiction_id === id) {
        childJurisdiction = { ...c };
        break;
      }
    }

    // return parent jurisidction
    if (childJurisdiction) {
      for (const p of jurisdictionsArray) {
        if (p.jurisdiction_id === childJurisdiction.parent_id) {
          return { ...p };
        }
      }
    }

    // if no child or parent jurisdiction is found, return null
    return null;
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

  /** getDrilldownPlanTableProps - getter for hierarchical DrilldownTable props
   * @param props - component props
   * @returns tableProps|null - compatible object for DrillDownTable props
   */
  private getDrilldownPlanTableProps(state: IrsPlanState) {
    const { filteredJurisdictions, newPlan } = state;

    if (!newPlan || !newPlan.plan_jurisdictions_ids) {
      return null;
    }

    const planJurisdictionIds = [...newPlan.plan_jurisdictions_ids];
    const onToggleAllCheckboxChange = (e: any) => {
      this.onToggleAllCheckboxChange(e);
    };
    const onTableCheckboxChange = (e: any) => {
      this.onTableCheckboxChange(e);
    };
    const onTableCheckboxClick = (e: any) => {
      e.stopPropagation();
    };

    const onDrilldownClick = (e: any) => {
      if (e && e.target && e.target.id) {
        this.onDrilldownClick(e.target.id);
      }
    };

    const columns = [
      {
        Header: () => (
          <Input
            checked={planJurisdictionIds.length === filteredJurisdictions.length}
            className="plan-jurisdiction-select-all-checkbox"
            onChange={onToggleAllCheckboxChange}
            type="checkbox"
          />
        ),
        columns: [
          {
            Header: '',
            accessor: (j: Jurisdiction) => (
              <Input
                checked={planJurisdictionIds.includes(j.jurisdiction_id)}
                className="plan-jurisdiction-selection-checkbox"
                onChange={onTableCheckboxChange}
                onClick={onTableCheckboxClick}
                type="checkbox"
                value={j.jurisdiction_id}
              />
            ),
            id: 'jurisdiction_selection',
            maxWidth: 24,
          },
        ],
      },
      {
        Header: 'Name',
        columns: [
          {
            Header: '',
            accessor: (j: Jurisdiction) => (
              <span id={j.jurisdiction_id} onClick={onDrilldownClick}>
                {j.name}
              </span>
            ),
            id: 'name',
          },
        ],
      },
      {
        Header: 'ID',
        columns: [
          {
            Header: '',
            accessor: 'jurisdiction_id',
          },
        ],
      },
    ];

    const tableProps: DrillDownProps<any> = {
      CellComponent: DropDownCell,
      columns,
      data: filteredJurisdictions.map((j: any) => ({
        ...j,
        id: j.jurisdiction_id,
      })),
      identifierField: 'jurisdiction_id',
      linkerField: 'name',
      minRows: 0,
      parentIdentifierField: 'parent_id',
      rootParentId: this.state.focusJurisdictionId,
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
