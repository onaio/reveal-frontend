import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Col, Container, Row } from 'reactstrap';
import Header from '../components/page/Header/Header';
import Home from '../containers/pages/Home/Home';
import IRS from '../containers/pages/IRS/IRS';

library.add(faUser);

import './App.css';

class App extends Component {
  public render() {
    return (
      <Container>
        <Header />
        <Row>
          <Col>
            <Switch>
              <Route exact={true} path="/" component={Home} />
              <Route exact={true} path="/irs" component={IRS} />
            </Switch>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
