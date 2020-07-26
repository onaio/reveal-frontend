import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import Button from 'reactstrap/lib/Button';
import { ActionCreator, Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb, {
  Page,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
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
  ASSIGN_PLAN_URL,
  AUTO_ASSIGN_JURISDICTIONS_URL,
  MANUAL_ASSIGN_JURISDICTIONS_URL,
  PLANNING_VIEW_URL,
} from '../../../../constants';
import { putJurisdictionsToPlan } from '../../../../helpers/dataLoading/jurisdictions';
import { displayError } from '../../../../helpers/errors';
import { isPlanDefinitionOfType, successGrowl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import hierarchyReducer, {
  autoSelectNodes,
  AutoSelectNodesAction,
  deselectAllNodes,
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
import { nodeIsSelected, selectionReason } from '../../../../store/ducks/opensrp/hierarchies/utils';
import { JurisdictionsMetadata } from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import {
  addPlanDefinition,
  AddPlanDefinitionAction,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { InterventionType, PlanStatus } from '../../../../store/ducks/plans';
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
  deselectAllNodesCreator: typeof deselectAllNodes;
}

const defaultProps = {
  autoSelectNodesCreator: autoSelectNodes,
  autoSelectionFlow: false,
  currentChildren: [],
  currentParentId: undefined,
  currentParentNode: undefined,
  deselectAllNodesCreator: deselectAllNodes,
  deselectNodeCreator: deselectNode,
  fetchPlanCreator: addPlanDefinition,
  jurisdictionsMetadata: [],
  leafNodes: [],
  rootJurisdictionId: '',
  selectNodeCreator: selectNode,
  selectedLeafNodes: [],
  serviceClass: OpenSRPService,
  tree: undefined,
  treeFetchedCreator: fetchTree,
};

/** JurisdictionTable responsibilities,
 * 1).
 * 2). also gets the locations that are already assigned to plan
 *    - that's why I passed the plan as a prop
 * 3). render the drill down table.
 */
const JurisdictionTable = (props: JurisdictionSelectorTableProps) => {
  const {
    rootJurisdictionId,
    currentParentNode,
    currentChildren,
    selectNodeCreator,
    deselectNodeCreator,
    fetchPlanCreator,
    selectedLeafNodes,
    plan,
    jurisdictionsMetadata,
    serviceClass,
    autoSelectionFlow,
    deselectAllNodesCreator,
  } = props;

  /** function for determining whether the jurisdiction assignment table allows for
   * multiple selection or single selection based on the plan intervention type
   *
   * for planTypes that require single jurisdiction we will :
   *  enabling a checkbox will be bound by these rules
   *    1) if checkbox is a parent checkbox(i.e. if not belonging to a leaf node) disable.
   */
  const isSingleSelect = (thePlan: PlanDefinition) => {
    const interventionTypes = [
      InterventionType.DynamicFI,
      InterventionType.FI,
      InterventionType.MDA,
      InterventionType.MDAPoint,
      InterventionType.DynamicMDA,
    ];
    return isPlanDefinitionOfType(thePlan, interventionTypes);
  };

  const history = useHistory();
  const { broken, errorMessage, handleBrokenPage } = useHandleBrokenPage();
  const baseUrl = !autoSelectionFlow
    ? `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`
    : `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`;
  const singleSelect = isSingleSelect(plan);

  /** helper function that decides which action creator to call when
   * changing the selected status of a node
   * @param nodId - id of the node of interest
   * @param value - change selected status of node with said id to value
   */
  function applySelectedToNode(nodeId: string, value: boolean) {
    if (value) {
      if (singleSelect) {
        deselectAllNodesCreator(rootJurisdictionId);
      }
      selectNodeCreator(rootJurisdictionId, nodeId, selectionReason.USER_CHANGE);
    } else {
      deselectNodeCreator(rootJurisdictionId, nodeId, selectionReason.USER_CHANGE);
    }
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
        disabled={node.hasChildren() && singleSelect}
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
              key={`${node.model.id}-risk-label`}
              node={node}
              metadata={jurisdictionsMetadata}
            />,
          ]
        : []),
      node.hasChildren() ? '' : nodeIsSelected(node) ? 'Targeted' : 'Not Targeted',
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
        history.push(PLANNING_VIEW_URL);
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
        successGrowl(`${selectedLeafNodes.length} ${JURISDICTION_ASSIGNMENT_SUCCESSFUL}`);
        history.push(teamAssignmentUrl);
      })
      .catch(err => displayError(err));
  };

  return (
    <div>
      <HeaderBreadcrumb {...breadCrumbProps} />
      <ListView {...listViewProps} />
      {!data.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_ROWS_FOUND}
          <hr />
        </div>
      )}
      {!!data.length && (
        <>
          <hr />

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
            color="success"
            onClick={onSaveAndActivate}
            size="xs"
          >
            {SAVE_AND_ACTIVATE}
          </Button>
        </>
      )}
    </div>
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
  | 'deselectAllNodesCreator'
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
  deselectAllNodesCreator: deselectAllNodes,
  deselectNodeCreator: deselectNode,
  fetchPlanCreator: addPlanDefinition,
  selectNodeCreator: selectNode,
  treeFetchedCreator: fetchTree,
};

export const ConnectedJurisdictionTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionTable);
