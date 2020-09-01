import ElementMap from '@onaio/element-map';
import ListView, { renderHeadersFuncType } from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Button, Tooltip } from 'reactstrap';
import { Store } from 'redux';
import { ErrorPage } from '../../../../../components/page/ErrorPage';
import HeaderBreadcrumb, {
  Page,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { PLAN_TYPES_WITH_MULTI_JURISDICTIONS } from '../../../../../configs/env';
import {
  JURISDICTION_ASSIGNMENT_SUCCESSFUL,
  NAME,
  NO_DATA_FOUND,
  NO_ROWS_FOUND,
  NOT_TARGETED,
  SAVE_AND_ACTIVATE,
  SAVE_DRAFT,
  SELECT_JURISDICTION,
  SELECTED_JURISDICTIONS,
  STATUS_SETTING,
  STRUCTURES_COUNT,
  TARGETED,
  TARGETED_STATUS,
} from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import {
  ASSIGN_PLAN_URL,
  AUTO_ASSIGN_JURISDICTIONS_URL,
  MANUAL_ASSIGN_JURISDICTIONS_URL,
  PLANNING_VIEW_URL,
  RISK_LABEL,
} from '../../../../../constants';
import { putJurisdictionsToPlan } from '../../../../../helpers/dataLoading/jurisdictions';
import { displayError } from '../../../../../helpers/errors';
import { getPlanType, successGrowl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import hierarchyReducer, {
  autoSelectNodes,
  deselectAllNodes,
  deselectNode,
  fetchTree,
  Filters,
  getAllSelectedNodes,
  getCurrentChildren,
  getCurrentParentNode,
  reducerName as hierarchyReducerName,
  selectNode,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { SELECTION_REASON } from '../../../../../store/ducks/opensrp/hierarchies/constants';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import { nodeIsSelected } from '../../../../../store/ducks/opensrp/hierarchies/utils';
import { JurisdictionsMetadata } from '../../../../../store/ducks/opensrp/jurisdictionsMetadata';
import { addPlanDefinition } from '../../../../../store/ducks/opensrp/PlanDefinition';
import { PlanStatus } from '../../../../../store/ducks/plans';
import { NodeCell } from '../JurisdictionCell';
import { RiskLabel } from '../RiskLabel';
import { SelectedJurisdictionsCount } from '../SelectedJurisdictionsCount';
import { checkParentCheckbox, useHandleBrokenPage } from '../utils';
import './index.css';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for the Jurisdiction selector table component */
export interface JurisdictionSelectorTableProps {
  tree?: TreeNode;
  plan: PlanDefinition;
  rootJurisdictionId: string;
  currentParentId?: string;
  jurisdictionsMetadata: JurisdictionsMetadata[];
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: typeof fetchTree;
  currentParentNode?: TreeNode;
  currentChildren: TreeNode[];
  selectNodeCreator: typeof selectNode;
  deselectNodeCreator: typeof deselectNode;
  autoSelectNodesCreator: typeof autoSelectNodes;
  fetchPlanCreator: typeof addPlanDefinition;
  selectedLeafNodes: TreeNode[];
  autoSelectionFlow: boolean;
  deselectAllNodesCreator: typeof deselectAllNodes;
}

const defaultProps = {
  autoSelectNodesCreator: autoSelectNodes,
  autoSelectionFlow: false,
  currentChildren: [],
  deselectAllNodesCreator: deselectAllNodes,
  deselectNodeCreator: deselectNode,
  fetchPlanCreator: addPlanDefinition,
  jurisdictionsMetadata: [],
  rootJurisdictionId: '',
  selectNodeCreator: selectNode,
  selectedLeafNodes: [],
  serviceClass: OpenSRPService,
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

  const [activateTooltipOpen, setActivateTooltipOpen] = useState(false);
  const [draftTooltipOpen, setDraftTooltipOpen] = useState(false);

  /** function for determining whether the jurisdiction assignment table allows for
   * multiple selection or single selection based on the plan intervention type
   *
   * for planTypes that require single jurisdiction we will :
   *  enabling a checkbox will be bound by these rules
   *    1) if checkbox is a parent checkbox(i.e. if not belonging to a leaf node) disable.
   */
  const isSingleSelect = (thePlan: PlanDefinition) => {
    const thePlanType = getPlanType(thePlan);
    return !PLAN_TYPES_WITH_MULTI_JURISDICTIONS.includes(thePlanType);
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
  function applySelectedToNode(nodeId: string, planId: string, value: boolean) {
    if (value) {
      if (singleSelect) {
        // TODO:  deselect only node selections belonging to this plan
        deselectAllNodesCreator(rootJurisdictionId);
      }
      selectNodeCreator(rootJurisdictionId, nodeId, planId, SELECTION_REASON.USER_CHANGE);
    } else {
      deselectNodeCreator(rootJurisdictionId, nodeId, planId, SELECTION_REASON.USER_CHANGE);
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
          applySelectedToNode(node.model.id, plan.identifier, newSelectedValue);
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
      node.hasChildren() ? '' : nodeIsSelected(node) ? TARGETED : NOT_TARGETED,
      node.model.meta.actionBy,
      <SelectedJurisdictionsCount
        key={`${node.model.id}-selected-jurisdictions-txt`}
        parentNode={node}
        selectedNodes={selectedLeafNodes}
      />,
    ];
  });
  const headerItems = [
    '',
    NAME,
    STRUCTURES_COUNT,
    ...(autoSelectionFlow ? [RISK_LABEL] : []),
    TARGETED_STATUS,
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
      applySelectedToNode(currentParentNode.model.id, plan.identifier, newSelectedValue);
    } else {
      currentChildren.forEach(child => {
        applySelectedToNode(child.model.id, plan.identifier, newSelectedValue);
      });
    }
  };

  const renderHeaders: renderHeadersFuncType = items => {
    const localItems = items ? [...items] : [];
    localItems.shift();
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
          <ElementMap items={localItems} HTMLTag="th" />
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

  /** toggle save & activate button tooltip */
  const toggleActivateToolTip = () => setActivateTooltipOpen(!activateTooltipOpen);
  /** toggle save draft button tooltip */
  const toggleDraftToolTip = () => setDraftTooltipOpen(!draftTooltipOpen);

  // check if there is any selected node
  const hasSelectedNode: boolean = selectedLeafNodes.length > 0;

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
        <Fragment>
          <hr />

          <span id="save-draft-wrapper" className="float-right">
            <Button
              disabled={!hasSelectedNode}
              id="save-draft"
              color="primary"
              // tslint:disable-next-line: jsx-no-lambda
              onClick={() => commitJurisdictions(plan)}
              size="xs"
            >
              {SAVE_DRAFT}
            </Button>
          </span>

          <span id="save-and-activate-wrapper" className="float-right mr-3">
            <Button
              disabled={!hasSelectedNode}
              id="save-and-activate"
              color="success"
              onClick={onSaveAndActivate}
              size="xs"
            >
              {SAVE_AND_ACTIVATE}
            </Button>
          </span>
        </Fragment>
      )}
      {!hasSelectedNode && (
        <Fragment>
          <Tooltip
            placement="top"
            isOpen={activateTooltipOpen}
            target="save-and-activate-wrapper"
            toggle={toggleActivateToolTip}
          >
            {SELECT_JURISDICTION}
          </Tooltip>
          <Tooltip
            placement="top"
            isOpen={draftTooltipOpen}
            target="save-draft-wrapper"
            toggle={toggleDraftToolTip}
          >
            {SELECT_JURISDICTION}
          </Tooltip>
        </Fragment>
      )}
    </div>
  );
};

JurisdictionTable.defaultProps = defaultProps;

export { JurisdictionTable };

/** map state to props interface  */
type MapStateToProps = Pick<
  JurisdictionSelectorTableProps,
  'currentChildren' | 'currentParentNode' | 'selectedLeafNodes'
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
const selectedLeafNodesSelector = getAllSelectedNodes();

/** maps props to store state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionSelectorTableProps
): MapStateToProps => {
  const filters: Filters = {
    currentParentId: ownProps.currentParentId,
    leafNodesOnly: true,
    planId: ownProps.plan.identifier,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };

  return {
    currentChildren: childrenSelector(state, filters),
    currentParentNode: parentNodeSelector(state, filters),
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
