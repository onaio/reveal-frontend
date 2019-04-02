// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Col, Row, Table } from 'reactstrap';
import NotFound from '../../../../components/NotFound';
import {
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FOCUS_AREA_INFO,
  FOCUS_INVESTIGATION,
} from '../../../../constants';
import { get137Value } from '../../../../helpers/indicators';
import ProgressBar from '../../../../helpers/ProgressBar';
import { RouteParams } from '../../../../helpers/utils';
import { dataByID, dataIds } from '../active/tests/fixtures';
import './single.css';

/** Reporting for Single Active Focus Investigation */
class SingleFI extends React.Component<RouteComponentProps<RouteParams>, {}> {
  constructor(props: RouteComponentProps<RouteParams>) {
    super(props);
  }

  public render() {
    let id: number | null = null;
    if (this.props.match && this.props.match.params && this.props.match.params.id) {
      id = Number(this.props.match.params.id);
    }

    if (id === null || !dataIds.includes(id)) {
      return <NotFound />;
    }

    const theObject = dataByID[id];

    return (
      <div>
        <h2 className="page-title mt-4 mb-5">
          {FOCUS_INVESTIGATION} in {theObject.focusArea}
        </h2>
        <Row>
          <Col className="col-6">
            <h4 className="mb-4">{FOCUS_AREA_INFO}</h4>
            <div style={{ background: 'lightgrey', height: '200px' }} />
            <dl className="row mt-3">
              <dt className="col-5">Province</dt>
              <dd className="col-7">{theObject.province}</dd>
              <dt className="col-5">District</dt>
              <dd className="col-7">{theObject.district}</dd>
              <dt className="col-5">Canton</dt>
              <dd className="col-7">{theObject.canton}</dd>
              <dt className="col-5">Village</dt>
              <dd className="col-7">{theObject.village}</dd>
              <dt className="col-5">FI Status</dt>
              <dd className="col-7">{theObject.status}</dd>
              <dt className="col-5">Last Visit</dt>
              <dd className="col-7">{theObject.caseNotificationDate}</dd>
              <dt className="col-5">FI Response Adherence</dt>
              <dd className="col-7">Yes</dd>
            </dl>
            <hr />
            <h5 className="mb-4 mt-4">Past Investigations</h5>
            <Table>
              <tbody>
                <tr>
                  <td>
                    <a href={`${FI_SINGLE_MAP_URL}/13`}>
                      <FontAwesomeIcon icon={['fas', 'map']} />
                    </a>
                    &nbsp;&nbsp;
                    <a href={`${FI_SINGLE_URL}/13`}>{theObject.caseNotificationDate}</a>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col className="col-6">
            <div className="fi-active">
              <h5 className="mb-4 mt-1">
                <a href={`${FI_SINGLE_MAP_URL}/13`}>
                  <FontAwesomeIcon icon={['fas', 'map']} />
                </a>
                &nbsp;&nbsp;
                <a href={`${FI_SINGLE_URL}/13`}>
                  Active Investigation: {theObject.caseNotificationDate}
                </a>
              </h5>
              <dl className="row mt-3">
                <dt className="col-5">Reveal User</dt>
                <dd className="col-7">username</dd>
                <dt className="col-5">Case Notification Date</dt>
                <dd className="col-7">{theObject.caseNotificationDate}</dd>
                <dt className="col-5">Case Classification</dt>
                <dd className="col-7">{theObject.caseClassification}</dd>
                <dt className="col-5">1-3-7 Adherence</dt>
                <dd className="col-7">
                  {get137Value(theObject.adherence1)},&nbsp;
                  {get137Value(theObject.adherence3)},&nbsp;
                  {get137Value(theObject.adherence7)} days to go
                </dd>
                <dt className="col-5">Complete</dt>
                <dd className="col-7">No</dd>
              </dl>
              <hr />
              <h5 className="mb-4 mt-4">Response</h5>
              <div className="responseItem">
                <p>T&T: Yes</p>
                <div className="targetItem">
                  <p>Target: 13 of 50 people within 1 km</p>
                  <ProgressBar value={13} max={50} />
                </div>
                <div className="targetItem">
                  <p>Target: 9 of 10 HHs within 1 km</p>
                  <ProgressBar value={9} max={10} />
                </div>
              </div>
              <div className="responseItem">
                <p>ITN: Yes</p>
                <div className="targetItem">
                  <p>Target: 8 of 10 Houses</p>
                  <ProgressBar value={8} max={10} />
                </div>
                <div className="targetItem">
                  <p>Target: 15 of 100%</p>
                  <ProgressBar value={15} max={100} />
                </div>
              </div>
              <Row className="mt-5">
                <Col className="col-6 offset-md-3">
                  <button type="button" className="btn btn-outline-primary btn-block">
                    Mark as complete
                  </button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SingleFI;
