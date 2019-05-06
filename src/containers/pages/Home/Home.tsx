// this is the home page component
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ENABLE_FI, ENABLE_IRS } from '../../../configs/env';
import { FI_URL, IRS_URL } from '../../../constants';
import './Home.css';

class Home extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return (
      <div className="text-center">
        <Row className="welcome-box">
          <Col>
            <h3>Welcome to Reveal</h3>
            <p>Get started by selecting an intervention below</p>
          </Col>
        </Row>
        <Row className="intervention-box">
          {ENABLE_IRS && (
            <Col md="6">
              <Link to={IRS_URL} className="intervention-link">
                <Button
                  color="outline"
                  className="btn-intervention btn-lg btn-block btn-outline-dark"
                >
                  IRS
                </Button>
              </Link>
            </Col>
          )}
          {ENABLE_FI && (
            <Col md="6">
              <Link to={FI_URL} className="intervention-link">
                <Button
                  color="outline"
                  className="btn-intervention btn-lg btn-block btn-outline-dark"
                >
                  Focus Investigation
                </Button>
              </Link>
            </Col>
          )}
        </Row>
      </div>
    );
  }
}

export default Home;
