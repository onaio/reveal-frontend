import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Result } from '@onaio/utils/dist/types/types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import Button from 'reactstrap/lib/Button';
import { ActionCreator, Store } from 'redux';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb, {
  Page,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Ripple from '../../../../components/page/Loading';
import { JURISDICTION_METADATA_RISK_PERCENTAGE } from '../../../../configs/env';
import {
  AUTO_SELECTION,
  COULD_NOT_LOAD_JURISDICTION_HIERARCHY,
  EXISTING_SELECTION,
  JURISDICTION_ASSIGNMENT_SUCCESSFUL,
  NAME,
  NO_DATA_FOUND,
  NO_ROWS_FOUND,
  RISK_LABEL,
  SAVE,
  SELECTED_JURISDICTIONS,
  STATUS_SETTING,
  STRUCTURES_COUNT,
  USER_CHANGE,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { ASSIGN_JURISDICTIONS_URL, INTERVENTION_TYPE_CODE } from '../../../../constants';
import {
  LoadOpenSRPHierarchy,
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
import { RawOpenSRPHierarchy, TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { nodeIsSelected } from '../../../../store/ducks/opensrp/hierarchies/utils';
import { JurisdictionsMetadata } from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import { InterventionType } from '../../../../store/ducks/plans';
import { ConnectedSelectedJurisdictionsCount } from '../helpers/SelectedJurisdictionsCount';
import { checkParentCheckbox, useHandleBrokenPage } from '../helpers/utils';
import { NodeCell } from '../JurisdictionCell';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for the Jurisdiction selector table component */
export interface JurisdictionSelectorTableProps {
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
  selectedLeafNodes: TreeNode[];
  leafNodes: TreeNode[];
}

const defaultProps = {
  autoSelectNodesCreator: autoSelectNodes,
  currentChildren: [],
  currentParentId: undefined,
  currentParentNode: undefined,
  deselectNodeCreator: deselectNode,
  jurisdictionsMetadata: [],
  leafNodes: [],
  rootJurisdictionId: '',
  selectNodeCreator: selectNode,
  selectedLeafNodes: [],
  serviceClass: OpenSRPService,
  treeFetchedCreator: fetchTree,
};

/** JurisdictionTable responsibilities,
 * 1). get location hierarchy from api for the rootJurisdiction
 *    - for this I only need the root jurisdiction
 * 2). also gets the locations that are already assigned to plan
 *    - that's why I passed the plan as a prop
 * 3). render the drill down table.
 */
const JurisdictionTable = (props: JurisdictionSelectorTableProps) => {
  const {
    rootJurisdictionId,
    treeFetchedCreator,
    currentParentNode,
    currentChildren,
    selectNodeCreator,
    deselectNodeCreator,
    autoSelectNodesCreator,
    selectedLeafNodes,
    leafNodes,
    plan,
    jurisdictionsMetadata,
    serviceClass,
  } = props;
  /** helper function that decides which action creator to call when
   * changing the selected status of a node
   * @param nodId - id of the node of interest
   * @param value - change selected status of node with said id to value
   */
  function applySelectedToNode(nodeId: string, value: boolean) {
    if (value) {
      selectNodeCreator(rootJurisdictionId, nodeId);
    } else {
      deselectNodeCreator(rootJurisdictionId, nodeId);
    }
  }

  /** function for determining whether the jurisdiction assignment table allows for
   * multiple selection or single selection based on the plan intervention type
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
  const [isLeafNodesLoaded, setLeafNodeLoaded] = React.useState<boolean>(false);
  const [singleSelect] = React.useState<boolean>(isSingleSelect);
  const { broken, errorMessage, handleBrokenPage } = useHandleBrokenPage();
  const baseUrl = `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`;
  const jurisdictionMetaIds: string[] = jurisdictionsMetadata.map(meta => meta.key);

  /** callback used to do initial autoSelection ; auto selects all jurisdictions that are already assigned to a plan
   * @param node - takes a node and returns true if node should be auto-selected
   */
  const existingAssignments = props.plan.jurisdiction.map(jurisdiction => jurisdiction.code);
  const callback = (node: TreeNode) => {
    if (!leafNodes.filter(value => existingAssignments.includes(value.model.id)).length) {
      if (!node.hasChildren()) {
        const metaObj = jurisdictionsMetadata.find(
          (m: JurisdictionsMetadata) => m.key === node.model.id
        ) as JurisdictionsMetadata;
        return (
          jurisdictionMetaIds.includes(node.model.id) &&
          metaObj.value &&
          Number(metaObj.value) >= Number(JURISDICTION_METADATA_RISK_PERCENTAGE)
        );
      }
    } else {
      const isLeafNode = !node.hasChildren();
      if (isLeafNode) {
        return existingAssignments.includes(node.model.id);
      }
    }
    return false;
  };

  React.useEffect(() => {
    const params = {
      return_structure_count: true,
    };
    LoadOpenSRPHierarchy(rootJurisdictionId, OpenSRPService, params)
      .then((apiResponse: Result<RawOpenSRPHierarchy>) => {
        if (apiResponse.value) {
          const responseData = apiResponse.value;
          treeFetchedCreator(responseData);
          // TODO: should this be in both this useEffect and the next one?
          autoSelectNodesCreator(rootJurisdictionId, callback);
          setLoading(false);
        }
        if (apiResponse.error) {
          throw new Error(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
        }
      })
      .catch(() => {
        handleBrokenPage(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    if (leafNodes.length && !isLeafNodesLoaded) {
      // TODO: should this be in both this useEffect and the previous one?
      autoSelectNodesCreator(rootJurisdictionId, callback);
      setLeafNodeLoaded(true);
    }
  }, [leafNodes]);

  if (loading) {
    return <Ripple />;
  }

  if (broken) {
    return <ErrorPage errorMessage={errorMessage} />;
  }

  if (currentChildren.length === 0) {
    handleBrokenPage(NO_DATA_FOUND);
  }

  /** creating breadCrumb props */

  let currentPage: Page = {
    label: '....',
    url: baseUrl,
  };
  const pages: Page[] = [];

  if (currentParentNode) {
    const path = currentParentNode.getPath();
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
  const data = currentChildren.map(node => {
    const isLeafNode: boolean = leafNodes.map(leaf => leaf.model.id).includes(node.model.id);
    const metaObj = jurisdictionsMetadata.find(
      (m: JurisdictionsMetadata) => m.key === node.model.id
    ) as JurisdictionsMetadata;
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
      (metaObj && metaObj.value) || '',
      node.model.meta.selected && isLeafNode
        ? jurisdictionMetaIds.length &&
          jurisdictionMetaIds.includes(node.model.id) &&
          !leafNodes.filter(value => existingAssignments.includes(value.model.id)).length
          ? AUTO_SELECTION
          : leafNodes.filter(value => existingAssignments.includes(value.model.id)).length &&
            existingAssignments.includes(node.model.id)
          ? EXISTING_SELECTION
          : USER_CHANGE
        : '',
      node.model.node.attributes.structureCount,
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
    RISK_LABEL,
    STATUS_SETTING,
    STRUCTURES_COUNT,
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
          <th style={{ width: '70%' }}>{headerItems[1]}</th>
          <th>{headerItems[2]}</th>
          <th>{headerItems[3]}</th>
          <th>{headerItems[4]}</th>
          <th>{headerItems[5]}</th>
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

  /** put payload of selected jurisdictions with the plan info to the api */
  const commitJurisdictions = () => {
    const jurisdictionIds = selectedLeafNodes.map(node => node.model.id);
    putJurisdictionsToPlan(plan, jurisdictionIds, serviceClass)
      .then(() => {
        successGrowl(`${selectedLeafNodes.length} ${JURISDICTION_ASSIGNMENT_SUCCESSFUL}`);
      })
      .catch(error => displayError(error));
  };

  return (
    <Fragment>
      <Button className="float-right" color="primary" onClick={commitJurisdictions} size="xs">
        {SAVE}
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
  'treeFetchedCreator' | 'selectNodeCreator' | 'deselectNodeCreator' | 'autoSelectNodesCreator'
>;

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
    currentChildren: getCurrentChildren()(state, filters),
    currentParentNode: getCurrentParentNode()(state, filters),
    leafNodes: getLeafNodes()(state, filters),
    selectedLeafNodes: getAllSelectedNodes()(state, filters),
  };
};

/** maps action creators */
const mapDispatchToProps: DispatchToProps = {
  autoSelectNodesCreator: autoSelectNodes,
  deselectNodeCreator: deselectNode,
  selectNodeCreator: selectNode,
  treeFetchedCreator: fetchTree,
};

export const ConnectedJurisdictionTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionTable);
