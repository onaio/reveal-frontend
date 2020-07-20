import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import Button from 'reactstrap/lib/Button';
import { ActionCreator, Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb, {
  Page,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Ripple from '../../../../components/page/Loading';
import {
  JURISDICTION_ASSIGNMENT_SUCCESSFUL,
  NAME,
  NO_DATA_FOUND,
  NO_ROWS_FOUND,
  RISK_LABEL,
  SAVE_AND_ACTIVATE,
  SAVE_DRAFT,
  SELECTED_JURISDICTIONS,
  STATUS_SETTING,
  STRUCTURES_COUNT,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import {
  ASSIGN_JURISDICTIONS_URL,
  AUTO_ASSIGN_JURISDICTIONS_URL,
  INTERVENTION_TYPE_CODE,
} from '../../../../constants';
import {
  putJurisdictionsToPlan,
} from '../../../../helpers/dataLoading/jurisdictions';
import { displayError } from '../../../../helpers/errors';
import { successGrowl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import hierarchyReducer, {
  autoSelectNodes,
  AutoSelectNodesAction,
  deselectNode,
  DeselectNodeAction,
  FetchedTreeAction,
  fetchTree,
  Filters,
  getAllSelectedNodes,
  getCurrentChildren,
  getCurrentParentNode,
  getLeafNodes,
  reducerName as hierarchyReducerName,
  selectNode,
  SelectNodeAction,
} from '../../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { nodeIsSelected, SelectionReason } from '../../../../store/ducks/opensrp/hierarchies/utils';
import { JurisdictionsMetadata } from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import { InterventionType } from '../../../../store/ducks/plans';
import { RiskLabel } from '../helpers/RiskLabel';
import { ConnectedSelectedJurisdictionsCount } from '../helpers/SelectedJurisdictionsCount';
import { checkParentCheckbox, useHandleBrokenPage } from '../helpers/utils';
import { NodeCell } from '../JurisdictionCell';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for the Jurisdiction selector table component */
export interface JurisdictionSelectorTableProps {
  tree: TreeNode;
  plan: PlanDefinition;
  rootJurisdictionId: string;
  currentParentId: string | undefined;
  jurisdictionsMetadata: JurisdictionsMetadata[];
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: ActionCreator<FetchedTreeAction>;
  currentParentNode: TreeNode | undefined;
  currentChildren: TreeNode[];
  selectNodeCreator: ActionCreator<SelectNodeAction>;
  deselectNodeCreator: ActionCreator<DeselectNodeAction>;
  autoSelectNodesCreator: ActionCreator<AutoSelectNodesAction>;
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
  selectedLeafNodes: TreeNode[];
  leafNodes: TreeNode[];
  autoSelectionFlow: boolean;
}

const defaultProps = {
  autoSelectNodesCreator: autoSelectNodes,
  currentChildren: [],
  currentParentId: undefined,
  currentParentNode: undefined,
  deselectNodeCreator: deselectNode,
  fetchPlanCreator: addPlanDefinition,
  jurisdictionsMetadata: [],
  leafNodes: [],
  rootJurisdictionId: '',
  selectNodeCreator: selectNode,
  selectedLeafNodes: [],
  serviceClass: OpenSRPService,
  treeFetchedCreator: fetchTree,
  autoselectionFlow: false,
};

/** JurisdictionTable responsibilities,
 * 1). 
 * 2). also gets the locations that are already assigned to plan
 *    - that's why I passed the plan as a prop
 * 3). render the drill down table.
 */
/** 2 cases for this:
 * 1). used as part of the autoSelection process.
 *    when autoselection is enabled we finish the workflow in the plan assignment view,otherwise one would have to start all over.
 *    for the time being there will not be auto-selecting existing jurisdiction assignments.
 * 2). used when autoSelection is disabled.
 *    here we have to show previous selections.
 *    when autoselection is disabled autoSelect previously selected jurisdictions i.e. if plan is still draft.
 */
/** the business logic involved around the action handlers should remain in this component.
 * This compoent will effectively be a HOC that specifies what the action handlers are 
 * and passes those on to the table. The table should be thought of as the presentational
 * component.
 */
const JurisdictionTable = (props: JurisdictionSelectorTableProps) => {
  const {
    tree
    rootJurisdictionId,
    treeFetchedCreator,
    currentParentNode,
    currentChildren,
    selectNodeCreator,
    deselectNodeCreator,
    autoSelectNodesCreator,
    fetchPlanCreator,
    selectedLeafNodes,
    leafNodes,
    plan,
    jurisdictionsMetadata,
    serviceClass,
    autoSelectionFlow,
  } = props;
  /** helper function that decides which action creator to call when
   * changing the selected status of a node
   * @param nodId - id of the node of interest
   * @param value - change selected status of node with said id to value
   */
  function applySelectedToNode(nodeId: string, value: boolean) {
    if (value) {
      selectNodeCreator(rootJurisdictionId, nodeId, SelectionReason.USER_CHANGE);
    } else {
      deselectNodeCreator(rootJurisdictionId, nodeId, SelectionReason.USER_CHANGE);
    }
  }

  /** function for determining whether the jurisdiction assignment table allows for
   * multiple selection or single selection based on the plan intervention type
   */
  /** new computation for this: 
   * for FI and dynamic-FI we will :
   *  enabling a checkbox will be bound by these rules
   *    1) if checkbox is a parent checkbox(i.e. if not leaf node) disable.
   */
  const isSingleSelect = () => {
    const interventionType = plan.useContext.find(
      element => element.code === INTERVENTION_TYPE_CODE
    );
    if (
      interventionType &&
      (interventionType.valueCodableConcept === InterventionType.FI ||
        interventionType.valueCodableConcept === InterventionType.DynamicFI)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const [loading, setLoading] = React.useState<boolean>(true);
  // const [isLeafNodesLoaded, setLeafNodeLoaded] = React.useState<boolean>(false);
  const [singleSelect] = React.useState<boolean>(isSingleSelect);
  const { broken, errorMessage, handleBrokenPage } = useHandleBrokenPage();
  const baseUrl = !autoSelectionFlow
    ? `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`
    : `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`;

  /** TODO - this is domain logic that should not belong here. 
   * the tree should be in a proper state before it gets here 
   * What we could probably do is add a prop that tells this component if the we think data is 
   * now fully updated before rendering.
   * */
  /** this is used for auto-selecting existing assigned jurisdictions
   * it will be invoked when auto-selection is turned off.
   */
  const callback = (node: TreeNode) => {
    const existingAssignments = plan.jurisdiction;
    return existingAssignments.includes(node.model.id);
  };

  if (loading) {
    return <Ripple />;
  }

  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  if (!currentParentNode) {
    handleBrokenPage(NO_DATA_FOUND);
  }

  // we will use the currentParentId prop to know if the parent node has
  // been set, if drilling down has begun.
  let derivedParentNode = currentParentNode;
  let derivedChildrenNodes = currentChildren;
  if (!props.currentParentId) {
    derivedParentNode = undefined;
    derivedChildrenNodes = currentParentNode ? [currentParentNode] : [];
  }

  /** creating breadCrumb props */
  let currentPage: Page = {
    label: '....',
    url: baseUrl,
  };
  const pages: Page[] = [];

  if (derivedParentNode) {
    const path = derivedParentNode.getPath();
    const lastNode = path.pop();

    pages.push(currentPage);

    path.forEach(nd => {
      pages.push({
        label: nd.model.label,
        url: `${baseUrl}/${nd.model.id}`,
      });
    });

    currentPage = {
      label: (lastNode as TreeNode).model.label,
    };
  }

  const breadCrumbProps = {
    currentPage,
    pages,
  };
  const data = derivedChildrenNodes.map(node => {
    return [
      <input
        key={`${node.model.id}-check-jurisdiction`}
        type="checkbox"
        checked={nodeIsSelected(node)}
        disabled={
          singleSelect &&
          (node.hasChildren() || (selectedLeafNodes.length > 0 && !nodeIsSelected(node)))
        }
        // tslint:disable-next-line: jsx-no-lambda
        onChange={e => {
          const newSelectedValue = e.target.checked;
          applySelectedToNode(node.model.id, newSelectedValue);
        }}
      />,
      <NodeCell key={`${node.model.id}-jurisdiction`} node={node} baseUrl={baseUrl} />,
      node.model.node.attributes.structureCount,
      ...(autoSelectionFlow
        ? [
            <RiskLabel
              key={node.model.id + 'sdfasd'}
              node={node}
              metadata={jurisdictionsMetadata}
            />,
          ]
        : []),
      nodeIsSelected(node) ? 'Targeted' : 'NotTargeted', // this too makes sense for the leaf nodes
      node.model.meta.selectedBy,
      <ConnectedSelectedJurisdictionsCount
        key={`selected-jurisdictions-txt`}
        parentNode={node}
        id={node.model.id}
        jurisdictions={selectedLeafNodes}
      />,
    ];
  });
  const headerItems = [
    '',
    NAME,
    STRUCTURES_COUNT,
    ...(autoSelectionFlow ? [RISK_LABEL] : []),
    'Target Status',
    STATUS_SETTING,
    SELECTED_JURISDICTIONS,
  ];
  const tableClass = 'table table-bordered';

  /** on change handler attached to the parent checkbox
   * @param e - the change event
   */
  const onParentCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedValue = e.target.checked;
    if (currentParentNode) {
      applySelectedToNode(currentParentNode.model.id, newSelectedValue);
    } else {
      currentChildren.forEach(child => {
        applySelectedToNode(child.model.id, newSelectedValue);
      });
    }
  };

  const renderHeaders = () => {
    return (
      <thead className="thead-plan-orgs">
        <tr>
          <th style={{ width: '5%' }}>
            <input
              type="checkbox"
              checked={checkParentCheckbox(currentParentNode, currentChildren)}
              disabled={singleSelect}
              onChange={onParentCheckboxClick}
            />
          </th>
          <th>{headerItems[1]}</th>
          <th>{headerItems[2]}</th>
          <th>{headerItems[3]}</th>
          <th>{headerItems[4]}</th>
          <th>{headerItems[5]}</th>
          {autoSelectionFlow && <th>{headerItems[6]}</th>}
        </tr>
      </thead>
    );
  };

  const listViewProps = {
    data,
    headerItems,
    renderHeaders,
    tableClass,
  };

  /** put payload of selected jurisdictions with the plan info to the api
   * @param thePlan - plan payload
   */
  const commitJurisdictions = (thePlan: PlanDefinition) => {
    const jurisdictionIds = selectedLeafNodes.map(node => node.model.id);
    return putJurisdictionsToPlan(thePlan, jurisdictionIds, serviceClass, fetchPlanCreator)
      .then(() => {
        successGrowl(`${selectedLeafNodes.length} ${JURISDICTION_ASSIGNMENT_SUCCESSFUL}`);
      })
      .catch(error => displayError(error));
  };

  /** click handler called when jurisdictions are saved and plan is set to active */
  const onSaveAndActivate = () => {
    const teamAssignmentUrl = `${ASSIGN_PLAN_URL}/${plan.identifier}`;
    // modify the active status of the plan;
    const planPayload = { ...plan, status: PlanStatus.ACTIVE };
    commitJurisdictions(planPayload)
      .then(() => {
        // redirect to this plans assignment page
        history.push(teamAssignmentUrl);
      })
      .catch(err => displayError(err));
  };

  return (
    <Fragment>
      <Button
        id="save-draft"
        className="float-right"
        color="primary"
        // tslint:disable-next-line: jsx-no-lambda
        onClick={() => commitJurisdictions(plan)}
        size="xs"
      >
        {SAVE_DRAFT}
      </Button>

      <Button
        id="save-and-activate"
        className="float-right mr-3"
        color="primary"
        onClick={onSaveAndActivate}
        size="xs"
      >
        {SAVE_AND_ACTIVATE}
      </Button>

      <HeaderBreadcrumb {...breadCrumbProps} />
      <ListView {...listViewProps} />
      {!data.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_ROWS_FOUND}
          <hr />
        </div>
      )}
    </Fragment>
  );
};

JurisdictionTable.defaultProps = defaultProps;

export { JurisdictionTable };

/** map state to props interface  */
type MapStateToProps = Pick<
  JurisdictionSelectorTableProps,
  'currentChildren' | 'currentParentNode' | 'selectedLeafNodes' | 'leafNodes'
>;

/** map action creators interface */
type DispatchToProps = Pick<
  JurisdictionSelectorTableProps,
  | 'treeFetchedCreator'
  | 'selectNodeCreator'
  | 'deselectNodeCreator'
  | 'autoSelectNodesCreator'
  | 'fetchPlanCreator'
>;

const childrenSelector = getCurrentChildren();
const parentNodeSelector = getCurrentParentNode();
const leafNodesSelector = getLeafNodes();
const selectedLeafNodesSelector = getAllSelectedNodes();

/** maps props to store state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionSelectorTableProps
): MapStateToProps => {
  const filters: Filters = {
    currentParentId: ownProps.currentParentId,
    leafNodesOnly: true,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };
  return {
    currentChildren: childrenSelector(state, filters),
    currentParentNode: parentNodeSelector(state, filters),
    leafNodes: leafNodesSelector(state, filters),
    selectedLeafNodes: selectedLeafNodesSelector(state, filters),
  };
};

/** maps action creators */
const mapDispatchToProps: DispatchToProps = {
  autoSelectNodesCreator: autoSelectNodes,
  deselectNodeCreator: deselectNode,
  fetchPlanCreator: addPlanDefinition,
  selectNodeCreator: selectNode,
  treeFetchedCreator: fetchTree,
};

export const ConnectedJurisdictionTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionTable);
