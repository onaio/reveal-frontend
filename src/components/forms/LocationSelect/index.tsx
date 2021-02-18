import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import TreeMenu, { ItemComponent } from 'react-simple-tree-menu';
import 'react-simple-tree-menu/dist/main.css';
import { Col, Row } from 'reactstrap';
import { OPENSRP_ACTIVE } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { getFilterParams, OpenSRPService } from '../../../services/opensrp';
import { NoDataComponent } from '../../Table/NoDataComponent';
import { FIND_BY_PROPERTIES } from '../../TreeWalker/constants';
import { JurisdictionOption } from '../JurisdictionSelect';
import { buildLocationTree, JurisdictionTree } from './helpers';
import './index.css';

interface LocationSelectProps {
  endpoint: string;
  service: typeof OpenSRPService;
}

const LocationSelect = (props: LocationSelectProps) => {
  const { service, endpoint } = props;
  const [treeData, setTreeData] = useState<JurisdictionTree[]>([]);

  const getJurisdiction = (parentId: string = '') => {
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
    apiService
      .list({ ...params })
      .then((jurisdictionApiPayload: JurisdictionOption[]) => {
        if (jurisdictionApiPayload.length) {
          const tree = buildLocationTree(jurisdictionApiPayload, parentId);
          setTreeData(tree);
        }
      })
      .catch((error: Error) => {
        displayError(error);
      });
  };

  useEffect(() => {
    getJurisdiction();
  }, []);

  if (!treeData.length) {
    return <NoDataComponent />;
  }
  return (
    <TreeMenu
      data={treeData}
      hasSearch={false}
      debounceTime={125}
      // tslint:disable-next-line: jsx-no-lambda
      onClickItem={() => getJurisdiction}
    >
      {({ items }) => (
        <React.Fragment>
          {items.map(({ key, ...itemProp }) => (
            <Row>
              <Col>
                <ItemComponent key={key} {...itemProp} />
              </Col>
              <Col className="download-list">
                <button className="btn btn-link">
                  Download <FontAwesomeIcon className="download-icon" icon="download" />
                </button>
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
