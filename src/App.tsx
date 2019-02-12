import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import React, { Component } from 'react';
import Header from './components/page/Header';

library.add(faUser);

import './App.css';

class App extends Component {
  public render() {
    return (
      <div className="container">
        <Header />
      </div>
    );
  }
}

export default App;
