import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { percentage } from '@onaio/utils';
import { Result } from '@onaio/utils/dist/types/types';
import React, { useState } from 'react';
import InputRange, { Range } from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import { connect } from 'react-redux';
import Col from 'reactstrap/lib/Col';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import { ActionCreator, Store } from 'redux';
import LinkAsButton from '../../../../../components/LinkAsButton';
import { ErrorPage } from '../../../../../components/page/ErrorPage';
import {
  ADJUST_SLIDER_MESSAGE,
  COULD_NOT_LOAD_JURISDICTION_HIERARCHY,
  NUMBER_OF_STRUCTURES_IN_JURISDICTIONS,
} from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import {
  ASSIGN_JURISDICTIONS_URL,
  JURISDICTION_METADATA_RISK,
  RISK_LABEL,
} from '../../../../../constants';
import {
  loadJurisdictionsMetadata,
  LoadOpenSRPHierarchy,
} from '../../../../../helpers/dataLoading/jurisdictions';
import { displayError } from '../../../../../helpers/errors';
import { OpenSRPService } from '../../../../../services/opensrp';
import hierarchyReducer, {
  autoSelectNodes,
  AutoSelectNodesAction,
  FetchedTreeAction,
  fetchTree,
  getStructuresCount,
  getTreeById,
  reducerName as hierarchyReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import {
  RawOpenSRPHierarchy,
  TreeNode,
} from '../../../../../store/ducks/opensrp/hierarchies/types';
import jurisdictionMetadataReducer, {
  fetchJurisdictionsMetadata,
  FetchJurisdictionsMetadataAction,
  getJurisdictionsMetadata,
  reducerName,
} from '../../../../../store/ducks/opensrp/jurisdictionsMetadata';
import './slider.css';
import { Button } from 'reactstrap';
import { SelectionReason } from '../../../../../store/ducks/opensrp/hierarchies/utils';

reducerRegistry.register(reducerName, jurisdictionMetadataReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** what else does it need:
 * the tree and auto selection functionalities
 * we need a way to tell the tree we auto-selected this jurisdictions
 * in an auto-selection step
 * and a structures count
 */

interface Props {
  rootJurisdictionId: string;
  tree: TreeNode | undefined;
  structuresCount: number;
  serviceClass: typeof OpenSRPService;
  fetchJurisdictionsMetadataCreator: ActionCreator<FetchJurisdictionsMetadataAction>;
  jurisdictionsMetadata: any[];
  autoSelectCreator: ActionCreator<AutoSelectNodesAction>;
  fetchTreeCreator: ActionCreator<FetchedTreeAction>;
  plan: PlanDefinition | null;
  onClickNext: any
}

const defaultProps = {
  rootJurisdictionId: '',
  tree: undefined,
  structuresCount: 0,
  serviceClass: OpenSRPService,
  fetchJurisdictionsMetadataCreator: fetchJurisdictionsMetadata,
  jurisdictionsMetadata: [],
  autoSelectCreator: autoSelectNodes,
  fetchTreeCreator: fetchTree,
  plan: null,
  onClickNext: () => {return}
};

export const JurisdictionSelectionsSlider = (props: Props) => {
  const [value, setValue] = useState<number | Range>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    serviceClass,
    rootJurisdictionId,
    tree,
    structuresCount,
    autoSelectCreator,
    fetchJurisdictionsMetadataCreator,
    jurisdictionsMetadata,
    plan,
  } = props;

  React.useEffect(() => {
    const params = {
      return_structure_count: true,
    };
    LoadOpenSRPHierarchy(rootJurisdictionId, serviceClass, params)
      .then((apiResponse: Result<RawOpenSRPHierarchy>) => {
        if (apiResponse.value) {
          const responseData = apiResponse.value;
          props.fetchTreeCreator(responseData);
          onChangeComplete(value);
          setLoading(false);
        }
        if (apiResponse.error) {
          throw new Error(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
        }
      })
      .catch(() => {
        // handleBrokenPage(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
        setLoading(false);
      });
  }, []);

  const onChangeComplete = (value: number | Range) => {
    const metaJurOfInterest = jurisdictionsMetadata.filter(metaObject => metaObject.value > value);
    const jurisdictionsIdsMeta = metaJurOfInterest.map(meta => meta.key);
    const callback = (node: TreeNode) => {
      return jurisdictionsIdsMeta.includes(node.model.id);
    };
    autoSelectCreator(rootJurisdictionId, callback,  SelectionReason.AUTO_SELECTION);
  };

  const onChange = (value: number | Range) => setValue(value);

  /** takes you to the jurisdictions refinement page. */

  if (!plan) {
    return <ErrorPage errorMessage={'Could not load plan'} />;
  }

  const linkAsButtonProps = {
    classNameProp: 'focus-investigation btn btn-success float-right mt-3  ',
    text: 'Continue to next step',
    to: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
  };

  return (
    <div className="mt-3">
      <hr></hr>
      <Row>
        <Col xs="12" md={{ size: 8, offset: 2 }} style={{ textAlign: 'center' }}>
          <h4 className="mb-5 font-weight-bold">{ADJUST_SLIDER_MESSAGE}</h4>
          <Row className="auto-target-row mb-3">
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
        </Col>
      </Row>
      <hr />
      <Button className='btn btn-success float-right mt-3' onClick={props.onClickNext} >Continue to next step</Button>  
    </div>
  );
};

JurisdictionSelectionsSlider.defaultProps = defaultProps;

export type MapStateToProps = Pick<Props, 'structuresCount' | 'tree' | 'jurisdictionsMetadata'>;

export type MapDispatchToProps = Pick<
  Props,
  'autoSelectCreator' | 'fetchJurisdictionsMetadataCreator' | 'fetchTreeCreator'
>;

const structureCountSelector = getStructuresCount();
const treeSelector = getTreeById();

const mapStateToProps = (state: Partial<Store>, ownProps: Props): MapStateToProps => {
  const filters = {
    rootJurisdictionId: ownProps.rootJurisdictionId,
  };
  const structuresCount = structureCountSelector(state, filters);
  const tree = treeSelector(state, filters);
  const jurisdictionsMetadata = getJurisdictionsMetadata(state);
  return { structuresCount, tree, jurisdictionsMetadata };
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
