// this is the home page component
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ENABLE_FI, ENABLE_IRS, ENABLE_TEAMS } from '../../../configs/env';
import {
  FOCUS_INVESTIGATION,
  GET_STARTED_MESSAGE,
  HOME_TITLE,
  IRS_TITLE,
  ORGANIZATIONS_LABEL,
  WELCOME_TO_REVEAL,
} from '../../../configs/lang';
import { FI_URL, INTERVENTION_IRS_DRAFTS_URL, ORGANIZATIONS_LIST_URL } from '../../../constants';
import './Home.css';

class Home extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return (
      <div className="text-center">
        <Helmet>
          <title>{HOME_TITLE}</title>
        </Helmet>
        <Row className="welcome-box">
          <Col>
            <h3>{WELCOME_TO_REVEAL}</h3>
            <p>{GET_STARTED_MESSAGE}</p>
          </Col>
        </Row>
        <Row className="intervention-box">
          {ENABLE_IRS && (
            <Col md="6">
              <Link to={INTERVENTION_IRS_DRAFTS_URL} className="home-link">
                <Button
                  color="outline"
                  className="btn-intervention btn-lg btn-block btn-outline-green"
                >
                  {IRS_TITLE}
                </Button>
              </Link>
            </Col>
          )}
          {ENABLE_FI && (
            <Col md="6">
              <Link to={FI_URL} className="home-link">
                <Button
                  color="outline"
                  className="btn-intervention btn-lg btn-block btn-outline-green"
                >
                  {FOCUS_INVESTIGATION}
                </Button>
              </Link>
            </Col>
          )}
          {ENABLE_TEAMS && (
            <Col md="6">
              <Link to={ORGANIZATIONS_LIST_URL} className="home-link">
                <Button
                  color="outline"
                  className="btn-intervention btn-lg btn-block btn-outline-green"
                >
                  {ORGANIZATIONS_LABEL}
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
