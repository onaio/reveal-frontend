/** gives a summary of the selected jurisdictions as well as their structures count */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router';
import Button from 'reactstrap/lib/Button';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  Page,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  CONTINUE_TO_NEXT_STEP,
  NAME,
  NO_ROWS_FOUND,
  STRUCTURES_COUNT,
} from '../../../../configs/lang';
import { AUTO_ASSIGN_JURISDICTIONS_URL } from '../../../../constants';
import hierarchyReducer, {
  Filters,
  getNodesInSelectedTree,
  getSelectedHierarchy,
  reducerName as hierarchyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { NodeCell } from '../JurisdictionCell';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for the Jurisdiction selector table component */
export interface JurisdictionSelectorTableProps {
  tree?: TreeNode;
  currentParentId: string | undefined;
  rootJurisdictionId: string;
  currentParentNode: TreeNode | undefined;
  currentChildren: TreeNode[];
  onClickNext: () => void;
}

const defaultProps = {
  currentChildren: [],
  currentParentId: undefined,
  currentParentNode: undefined,
  onClickNext: () => {
    return;
  },
  rootJurisdictionId: '',
};

/** This component should provide a summary of the structures  */
const SelectedStructuresTable = (props: JurisdictionSelectorTableProps) => {
  const { rootJurisdictionId, currentParentNode, currentChildren } = props;

  const { planId } = useParams();
  const baseUrl = `${AUTO_ASSIGN_JURISDICTIONS_URL}/${planId}/${rootJurisdictionId}`;

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
      <NodeCell key={`${node.model.id}-structures-summary`} node={node} baseUrl={baseUrl} />,
      node.model.meta.metaStructureCount,
    ];
  });
  const headerItems = [NAME, STRUCTURES_COUNT];
  const tableClass = 'table table-bordered';

  const listViewProps = {
    data,
    headerItems,
    tableClass,
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
          <Button className="btn btn-success float-right mt-3" onClick={props.onClickNext}>
            {CONTINUE_TO_NEXT_STEP}
          </Button>
        </>
      )}
    </div>
  );
};

SelectedStructuresTable.defaultProps = defaultProps;

export { SelectedStructuresTable as JurisdictionTable };

/** map state to props interface  */
type MapStateToProps = Pick<
  JurisdictionSelectorTableProps,
  'currentChildren' | 'currentParentNode' | 'tree'
>;

const treeSelector = getSelectedHierarchy();
const nodeSelector = getNodesInSelectedTree();

/** maps props to store state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionSelectorTableProps
): MapStateToProps => {
  const filters: Filters = {
    currentParentId: ownProps.currentParentId,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };
  const tree = treeSelector(state, filters);
  const nodes = nodeSelector(state, filters);
  return {
    currentChildren: nodes.childrenNodes,
    currentParentNode: nodes.parentNode,
    tree,
  };
};

export const ConnectedSelectedStructuresTable = connect(mapStateToProps)(SelectedStructuresTable);
