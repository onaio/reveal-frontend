import ListView from '@onaio/list-view';
import React, { Fragment } from 'react';
import HeaderBreadcrumb, { Page } from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { NO_ROWS_FOUND } from '../../../configs/lang';
import { OpenSRPService } from '../../../services/opensrp';
import { nodeIsSelected, useJurisdictionTree } from './jurisdictionReducer';
import { JurisdictionCell } from './JurisdictionSelectCell';

export interface JurisdictionSelectorTableProps {
  rootJurisdictionId: string;
  serviceClass: typeof OpenSRPService;
}

// TODO - use url to store state of currentParentId
// export type JurisdictionTableProps = RouteComponentProps<RouteParams> & BaseJurisdictionTableProps;

/** JurisdictionTable responsibilities,
 * 1). get location hierarchy from api
 *    - for this we only need the root jurisdiction
 * 2). drilling down
 */
const JurisdictionTable = (props: JurisdictionSelectorTableProps) => {
  const { rootJurisdictionId } = props;

  const {
    applySelectToNode,
    currentParentNode,
    setCurrentParent,
    currentChildren,
  } = useJurisdictionTree(rootJurisdictionId);

  let currentPage: Page = {
    clickHandler: () => {
      setCurrentParent(undefined);
    },
    label: '....',
  };
  const pages: Page[] = [];

  if (currentParentNode) {
    const path = currentParentNode.getPath();
    const lastNode = path.pop();

    pages.push(currentPage);

    path.forEach(nd => {
      pages.push({
        clickHandler: (_: React.MouseEvent) => {
          setCurrentParent(nd);
        },
        label: nd.model.label,
      });
    });

    currentPage = {
      label: lastNode!.model.label,
    };
  }

  const breadCrumbProps = {
    currentPage,
    pages,
  };

  const data = currentChildren.map(node => {
    return [
      <input
        key={`${node.id}-check-jurisdiction`}
        type="checkbox"
        checked={nodeIsSelected(node)}
        // tslint:disable-next-line: jsx-no-lambda
        onChange={e => {
          const newSelectedValue = e.target.checked;
          applySelectToNode(node, newSelectedValue);
        }}
      />,
      <JurisdictionCell
        key={`${node.id}-jurisdiction`}
        node={node}
        // tslint:disable-next-line: jsx-no-lambda
        onClickCallback={_ => setCurrentParent(node)}
      />,
      node.model.node.attributes.structureCount,
    ];
  });
  const headerItems = ['', 'Name', 'Structures count'];
  const tableClass = 'table table-bordered';

  const parentNodeIsChecked = () => {
    let selected = true;
    if (currentParentNode) {
      selected = selected && nodeIsSelected(currentParentNode);
    } else {
      // this is to be used during the top level
      if (currentChildren.length > 0) {
        currentChildren.forEach(node => {
          selected = selected && nodeIsSelected(node);
        });
      } else {
        selected = false;
      }
    }
    return selected;
  };

  const renderHeaders = () => {
    return (
      <thead className="thead-plan-orgs">
        <tr>
          <th style={{ width: '25%' }}>
            <input
              type="checkbox"
              // checked if either currentParentNode is checked or all currentChildren are checked
              checked={parentNodeIsChecked()}
              // tslint:disable-next-line: jsx-no-lambda
              onChange={e => {
                const newSelectedValue = e.target.checked;
                if (currentParentNode) {
                  applySelectToNode(currentParentNode, newSelectedValue);
                } else {
                  currentChildren.forEach(child => {
                    applySelectToNode(child, newSelectedValue);
                  });
                }
              }}
            />
          </th>
          <th style={{ width: '25%' }}>{headerItems[1]}</th>
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

  return (
    <Fragment>
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

const defaultProps: JurisdictionSelectorTableProps = {
  rootJurisdictionId: '',
  serviceClass: OpenSRPService,
};

JurisdictionTable.defaultProps = defaultProps;

export { JurisdictionTable };
