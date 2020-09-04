/** gives a summary of the selected jurisdictions as well as their structures count */
import ElementMap from '@onaio/element-map';
import ListView, { renderRowsFunc, renderRowsFuncType } from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import Button from 'reactstrap/lib/Button';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  Page,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  CONTINUE_TO_NEXT_STEP,
  NAME,
  NO_JURISDICTION_SELECTIONS_FOUND,
  STRUCTURES_COUNT,
  TOTAL,
} from '../../../../../configs/lang';
import { AUTO_ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import hierarchyReducer, {
  Filters,
  getNodesInSelectedTree,
  reducerName as hierarchyReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import { getNodeStructureCount } from '../../../../../store/ducks/opensrp/hierarchies/utils';
import { NodeCell } from '../JurisdictionCell';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for the Jurisdiction selector table component */
export interface JurisdictionSelectorTableProps {
  planId: string;
  currentParentId?: string;
  rootJurisdictionId: string;
  currentParentNode?: TreeNode;
  currentChildren: TreeNode[];
  onClickNext: () => void;
}

const defaultProps = {
  currentChildren: [],
  onClickNext: () => {
    return;
  },
  rootJurisdictionId: '',
};

/** This component should provide a summary of the structures  */
const SelectedStructuresTable = (props: JurisdictionSelectorTableProps) => {
  const { rootJurisdictionId, currentParentNode, currentChildren, planId } = props;
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
      getNodeStructureCount(node),
    ];
  });
  const headerItems = [NAME, STRUCTURES_COUNT];
  const tableClass = 'table table-bordered';

  /** Adds a row in the footer that contains the total number of structures of all
   * jurisdictions that are descendants of the current parent node
   */
  const renderRows: renderRowsFuncType = (rowData, tbClass, tdClass, trClass) => {
    const parentNodeStructureCount = currentParentNode
      ? getNodeStructureCount(currentParentNode)
      : 0;
    const items = [TOTAL, parentNodeStructureCount];
    const tfootRow = (
      <tr className={trClass}>
        <ElementMap items={items} HTMLTag="td" className={`${tdClass} text-bold`} />
      </tr>
    );
    return (
      <>
        {renderRowsFunc(rowData, tbClass, tdClass, trClass)}
        {parentNodeStructureCount !== 0 && <tfoot>{tfootRow}</tfoot>}
      </>
    );
  };

  const listViewProps = {
    data,
    headerItems,
    renderRows,
    tableClass,
  };

  return (
    <div>
      <HeaderBreadcrumb {...breadCrumbProps} />
      <ListView {...listViewProps} />
      {!data.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_JURISDICTION_SELECTIONS_FOUND}
          <hr />
        </div>
      )}
      <>
        <hr />
        <Button className="btn btn-success float-right mt-3" onClick={props.onClickNext}>
          {CONTINUE_TO_NEXT_STEP}
        </Button>
      </>
    </div>
  );
};

SelectedStructuresTable.defaultProps = defaultProps;

export { SelectedStructuresTable as JurisdictionTable };

/** map state to props interface  */
type MapStateToProps = Pick<
  JurisdictionSelectorTableProps,
  'currentChildren' | 'currentParentNode'
>;

const nodeSelector = getNodesInSelectedTree();

/** maps props to store state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionSelectorTableProps
): MapStateToProps => {
  const filters: Filters = {
    currentParentId: ownProps.currentParentId,
    planId: ownProps.planId,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };
  const nodes = nodeSelector(state, filters);
  return {
    currentChildren: nodes.childrenNodes,
    currentParentNode: nodes.parentNode,
  };
};

export const ConnectedSelectedStructuresTable = connect(mapStateToProps)(SelectedStructuresTable);
