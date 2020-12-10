/** renders the range slider component that is used to set the
 * threshold from which we can filter out the jurisdictions to be
 * auto-targeted based on their risk value
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useState } from 'react';
import InputRange, { Range } from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { ActionCreator, Store } from 'redux';
import {
  ADJUST_SLIDER_MESSAGE,
  CONTINUE_TO_NEXT_STEP,
  JURISDICTIONS_SELECTED,
  NUMBER_OF_STRUCTURES_IN_JURISDICTIONS,
} from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { RISK_LABEL } from '../../../../../constants';
import hierarchyReducer, {
  autoSelectNodes,
  fetchTree,
  getAllSelectedNodes,
  getStructuresCount,
  getTreeById,
  reducerName as hierarchyReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { SELECTION_REASON } from '../../../../../store/ducks/opensrp/hierarchies/constants';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import jurisdictionMetadataReducer, {
  fetchJurisdictionsMetadata,
  FetchJurisdictionsMetadataAction,
  getJurisdictionsMetadata,
  JurisdictionsMetadata,
  reducerName,
} from '../../../../../store/ducks/opensrp/jurisdictionsMetadata';
import './slider.css';

reducerRegistry.register(reducerName, jurisdictionMetadataReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props for JurisdictionSelectionSlider */
interface Props {
  rootJurisdictionId: string;
  tree?: TreeNode;
  jurisdictionsCount: number /** number of selected jurisdictions */;
  structuresCount: number /** number of selected structures */;
  fetchJurisdictionsMetadataCreator: ActionCreator<FetchJurisdictionsMetadataAction>;
  jurisdictionsMetadata: JurisdictionsMetadata[];
  autoSelectCreator: typeof autoSelectNodes;
  fetchTreeCreator: typeof fetchTree;
  plan: PlanDefinition;
  onClickNext: () => void;
}

const defaultProps = {
  autoSelectCreator: autoSelectNodes,
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchTreeCreator: fetchTree,
  jurisdictionsCount: 0,
  jurisdictionsMetadata: [],
  onClickNext: () => {
    return;
  },
  rootJurisdictionId: '',
  structuresCount: 0,
};

/** renders a draggable slider that sets a value used as the
 * threshold for autoSelecting jurisdictions.
 */
export const JurisdictionSelectionsSlider = (props: Props) => {
  const [value, setValue] = useState<number | Range>(0);

  const {
    rootJurisdictionId,
    structuresCount,
    autoSelectCreator,
    jurisdictionsCount,
    jurisdictionsMetadata,
    plan,
    tree,
  } = props;

  const planId = plan.identifier;

  const onChangeComplete = (val: number | Range) => {
    const metaJurOfInterest = jurisdictionsMetadata.filter(
      metaObject => parseInt(metaObject.value || '0', 10) >= val
    );
    const jurisdictionsIdsMeta = metaJurOfInterest.map(meta => meta.key);
    const callback = (node: TreeNode) => {
      const isLeafNodePastThreshHold =
        !node.hasChildren() && jurisdictionsIdsMeta.includes(node.model.id);
      return isLeafNodePastThreshHold;
    };
    autoSelectCreator(rootJurisdictionId, callback, planId, SELECTION_REASON.AUTO_SELECTION);
  };

  React.useEffect(() => {
    onChangeComplete(value);
  }, []);

  const onChange = (val: number | Range) => setValue(val);

  if (!plan || !tree) {
    return null;
  }

  return (
    <div className="mt-3">
      <Row>
        <Col xs="12" md={{ size: 8, offset: 2 }} style={{ textAlign: 'center' }}>
          <h4 className="mb-5 font-weight-bold">{ADJUST_SLIDER_MESSAGE}</h4>
          <Row className="auto-target-row">
            <Col xs="12" md={6} className="slider-section py-3 px-5">
              <p>
                {RISK_LABEL}&nbsp;&nbsp;<span className="risk-label">{`${value}%`}</span>
              </p>
              <InputRange
                maxValue={100}
                minValue={0}
                value={value}
                onChange={onChange}
                onChangeComplete={onChangeComplete}
              />
            </Col>
            <Col xs="12" md={6} className="info-section p-3">
              <p>
                <FontAwesomeIcon icon="home" />
              </p>
              <p>{NUMBER_OF_STRUCTURES_IN_JURISDICTIONS}</p>
              <p>{structuresCount}</p>
            </Col>
          </Row>
          <Row className="auto-target-row mb-3">
            <Col xs="12" md="12" className="info-section py-0 px-5">
              <p className="text-center mt-3">
                {jurisdictionsCount} {JURISDICTIONS_SELECTED}
              </p>
            </Col>
          </Row>
        </Col>
      </Row>
      <hr />
      <Button className="btn btn-success float-right mt-3" onClick={props.onClickNext}>
        {CONTINUE_TO_NEXT_STEP}
      </Button>
    </div>
  );
};

JurisdictionSelectionsSlider.defaultProps = defaultProps;

/** map state to props */
export type MapStateToProps = Pick<
  Props,
  'structuresCount' | 'tree' | 'jurisdictionsCount' | 'jurisdictionsMetadata'
>;
/** map dispatch to action creators */
export type MapDispatchToProps = Pick<
  Props,
  'autoSelectCreator' | 'fetchJurisdictionsMetadataCreator' | 'fetchTreeCreator'
>;

const structureCountSelector = getStructuresCount();
const selectedJurisdictionSelector = getAllSelectedNodes();
const treeSelector = getTreeById();

const mapStateToProps = (state: Partial<Store>, ownProps: Props): MapStateToProps => {
  const filters = {
    planId: ownProps.plan.identifier,
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };
  const structuresCount = structureCountSelector(state, filters);
  const selectedJurisdictions = selectedJurisdictionSelector(state, {
    leafNodesOnly: true,
    ...filters,
  });
  const tree = treeSelector(state, filters);
  const jurisdictionsMetadata = getJurisdictionsMetadata(state);
  return {
    jurisdictionsCount: selectedJurisdictions.length,
    jurisdictionsMetadata,
    structuresCount,
    tree,
  };
};

const mapDispatchToProps: MapDispatchToProps = {
  autoSelectCreator: autoSelectNodes,
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  fetchTreeCreator: fetchTree,
};

export const ConnectedJurisdictionSelectionsSlider = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionSelectionsSlider);
