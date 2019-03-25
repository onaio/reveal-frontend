import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Col, Container, Row } from 'reactstrap';
import Header from '../components/page/Header/Header';
import { FI_URL, IRS_URL } from '../constants';
import ActiveFocusInvestigation from '../containers/pages/FocusInvestigation/active';
import HistoricalFocusInvestigation from '../containers/pages/FocusInvestigation/historical';
import Home from '../containers/pages/Home/Home';
import IRS from '../containers/pages/IRS/IRS';

library.add(faMap);
library.add(faUser);

import './App.css';

class App extends Component {
  public render() {
    return (
      <Container>
        <Header />
        <Row id="main-page-row">
          <Col>
            <Switch>
              <Route exact={true} path="/" component={Home} />
              <Route exact={true} path={IRS_URL} component={IRS} />
              <Route exact={true} path={FI_URL} component={ActiveFocusInvestigation} />
              <Route
                exact={true}
                path={`${FI_URL}/historical`}
                component={HistoricalFocusInvestigation}
              />
              <Route
                exact={true}
                path={`${FI_URL}/historical/:id`}
                component={HistoricalFocusInvestigation}
              />
            </Switch>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
