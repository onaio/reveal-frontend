// this is the home page component
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import {
  ENABLE_FI,
  ENABLE_HOME_MANAGE_PLANS_LINK,
  ENABLE_HOME_PLANNING_VIEW_LINK,
  ENABLE_TEAMS,
} from '../../../configs/env';
import {
  FOCUS_INVESTIGATION,
  GET_STARTED_MESSAGE,
  HOME_TITLE,
  ORGANIZATIONS_LABEL,
  PLANNING_PAGE_TITLE,
  PLANS,
  WELCOME_TO_REVEAL,
} from '../../../configs/lang';
import {
  FI_URL,
  ORGANIZATIONS_LIST_URL,
  PLAN_LIST_URL,
  PLANNING_VIEW_URL,
} from '../../../constants';
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
          {ENABLE_HOME_MANAGE_PLANS_LINK && (
            <Col md="6">
              <Link to={PLAN_LIST_URL} className="home-link">
                <Button
                  color="outline"
                  className="btn-intervention btn-lg btn-block btn-outline-green"
                >
                  {PLANS}
                </Button>
              </Link>
            </Col>
          )}
          {ENABLE_HOME_PLANNING_VIEW_LINK && (
            <Col md="6">
              <Link to={PLANNING_VIEW_URL} className="home-link">
                <Button
                  color="outline"
                  className="btn-intervention btn-lg btn-block btn-outline-green"
                >
                  {PLANNING_PAGE_TITLE}
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
