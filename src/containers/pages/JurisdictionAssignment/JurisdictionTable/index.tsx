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
import {
  COULD_NOT_LOAD_JURISDICTION_HIERARCHY,
  JURISDICTION_ASSIGNMENT_SUCCESSFUL,
  NAME,
  NO_DATA_FOUND,
  NO_ROWS_FOUND,
  SAVE,
  STRUCTURES_COUNT,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { ASSIGN_JURISDICTIONS_URL } from '../../../../constants';
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
  reducerName as hierarchyReducerName,
  selectNode,
  SelectNodeAction,
} from '../../../../store/ducks/opensrp/hierarchies';
import { RawOpenSRPHierarchy, TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { nodeIsSelected } from '../../../../store/ducks/opensrp/hierarchies/utils';
import { checkParentCheckbox, useHandleBrokenPage } from '../helpers/utils';
import { NodeCell } from '../JurisdictionCell';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for the Jurisdiction selector table component */
export interface JurisdictionSelectorTableProps {
  plan: PlanDefinition;
  rootJurisdictionId: string;
  currentParentId: string | undefined;
  serviceClass: typeof OpenSRPService;
  treeFetchedCreator: ActionCreator<FetchedTreeAction>;
  currentParentNode: TreeNode | undefined;
  currentChildren: TreeNode[];
  selectNodeCreator: ActionCreator<SelectNodeAction>;
  deselectNodeCreator: ActionCreator<DeselectNodeAction>;
  autoSelectNodesCreator: ActionCreator<AutoSelectNodesAction>;
  selectedLeafNodes: TreeNode[];
}

const defaultProps = {
  autoSelectNodesCreator: autoSelectNodes,
  currentChildren: [],
  currentParentId: undefined,
  currentParentNode: undefined,
  deselectNodeCreator: deselectNode,
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
    plan,
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

  const [loading, setLoading] = React.useState<boolean>(true);
  const { broken, errorMessage, handleBrokenPage } = useHandleBrokenPage();
  const baseUrl = `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`;

  /** callback used to do initial autoSelection ; auto selects all jurisdictions that are already assigned to a plan
   * @param node - takes a node and returns true if node should be auto-selected
   */
  const callback = (node: TreeNode) => {
    const existingAssignments = props.plan.jurisdiction.map(jurisdiction => jurisdiction.code);
    return existingAssignments.includes(node.model.id);
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
    return [
      <input
        key={`${node.model.id}-check-jurisdiction`}
        type="checkbox"
        checked={nodeIsSelected(node)}
        // tslint:disable-next-line: jsx-no-lambda
        onChange={e => {
          const newSelectedValue = e.target.checked;
          applySelectedToNode(node.model.id, newSelectedValue);
        }}
      />,
      <NodeCell key={`${node.model.id}-jurisdiction`} node={node} baseUrl={baseUrl} />,
      node.model.node.attributes.structureCount,
    ];
  });
  const headerItems = ['', NAME, STRUCTURES_COUNT];
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
              onChange={onParentCheckboxClick}
            />
          </th>
          <th style={{ width: '70%' }}>{headerItems[1]}</th>
          <th>{headerItems[2]}</th>
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
  'currentChildren' | 'currentParentNode' | 'selectedLeafNodes'
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
