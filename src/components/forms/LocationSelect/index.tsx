import React, { useEffect, useState } from 'react';
import TreeMenu, { ItemComponent, TreeNode } from 'react-simple-tree-menu';
import 'react-simple-tree-menu/dist/main.css';
import { toast } from 'react-toastify';
import { Col, Row } from 'reactstrap';
import { LOADING, LOWEST_JURISDICTION } from '../../../configs/lang';
import { OPENSRP_ACTIVE } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { growl } from '../../../helpers/utils';
import { getFilterParams, OpenSRPService } from '../../../services/opensrp';
import { NoDataComponent } from '../../Table/NoDataComponent';
import { FIND_BY_PROPERTIES } from '../../TreeWalker/constants';
import { JurisdictionOption } from '../JurisdictionSelect';
import { buildLocationTree, JurisdictionTreeById } from './helpers';
import './index.css';
import StudentExportForm from './StudentExportForm';

interface LocationSelectProps {
  endpoint: string;
  service: typeof OpenSRPService;
}

const LocationSelect = (props: LocationSelectProps) => {
  const { service, endpoint } = props;
  const [treeData, setTreeData] = useState<JurisdictionTreeById>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openNodes, setOpenNodes] = useState<string[]>([]);

  const getJurisdiction = (
    parentId: string = '',
    key: string = '',
    clickedNodes: string[] = []
  ) => {
    if (loadingId) {
      return;
    }
    if (clickedNodes.length && clickedNodes.includes(key)) {
      const newNodeitems = clickedNodes.filter(node => node !== key);
      setOpenNodes(newNodeitems);
      return;
    }
    setLoadingId(parentId);
    const propertiesToFilter = {
      status: OPENSRP_ACTIVE,
      ...(parentId === '' ? { geographicLevel: 0 } : { parentId }),
    };
    const params = {
      is_jurisdiction: true,
      properties_filter: getFilterParams(propertiesToFilter),
      return_geometry: false,
    };
    const apiService = new service(endpoint);
    // tslint:disable-next-line: no-floating-promises
    apiService
      .list({ ...params })
      .then((jurisdictionApiPayload: JurisdictionOption[]) => {
        if (!jurisdictionApiPayload.length) {
          growl(LOWEST_JURISDICTION, {
            type: toast.TYPE.SUCCESS,
          });
        } else {
          const tree = buildLocationTree(jurisdictionApiPayload, parentId, treeData, key);
          setTreeData(tree);
          const openCurrent = [...clickedNodes, key];
          setOpenNodes(parentId === key ? [parentId] : openCurrent);
        }
      })
      .catch((error: Error) => {
        displayError(error);
      })
      .finally(() => setLoadingId(null));
  };

  useEffect(() => {
    getJurisdiction();
  }, []);

  if (!Object.keys(treeData).length) {
    return <NoDataComponent />;
  }
  return (
    <TreeMenu
      data={treeData as TreeNode}
      hasSearch={false}
      debounceTime={125}
      openNodes={openNodes}
      // tslint:disable-next-line: jsx-no-lambda
      onClickItem={itemProps => {
        getJurisdiction(itemProps.id, itemProps.key, itemProps.openNodes);
      }}
    >
      {({ items }) => (
        <React.Fragment>
          {items.map(({ key, ...itemProp }) => (
            <Row key={`row-${key}`}>
              <Col>
                <ItemComponent key={key} {...itemProp} />
              </Col>
              <Col className="download-list">
                {loadingId === itemProp.id ? (
                  <div className="loading-text">{LOADING}...</div>
                ) : (
                  <StudentExportForm
                    {...{ initialValues: { id: itemProp.id, name: itemProp.label } }}
                  />
                )}
              </Col>
            </Row>
          ))}
        </React.Fragment>
      )}
    </TreeMenu>
  );
};

/** Component default props */
const defaultProps = {
  endpoint: FIND_BY_PROPERTIES,
  service: OpenSRPService,
};
LocationSelect.defaultProps = defaultProps;

export default LocationSelect;
