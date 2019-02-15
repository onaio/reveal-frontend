// this is the home page component
import * as React from 'react';
import { Button, Col, Row } from 'reactstrap';
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
          <Col md="6">
            <Button color="outline" className="btn-intervention btn-lg btn-block btn-outline-dark">
              IRS
            </Button>
          </Col>
          <Col md="6">
            <Button color="outline" className="btn-intervention btn-lg btn-block btn-outline-dark">
              Focus Investigation
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Home;
