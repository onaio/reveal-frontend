import React from 'react';
import logo from '../../../assets/images/logo.png';
import {
  REACT_APP_NAME,
  REACT_APP_PRODUCTION_INST,
  REACT_APP_VERSION,
  WEBSITE_NAME,
} from '../../../configs/env';
import { TH_PRODUCTION_INST } from '../../../constants';
import './footer.css';

/** footer component; to render react-version on the web ui */
export const Footer = () => {
  if (REACT_APP_PRODUCTION_INST === TH_PRODUCTION_INST) {
    return (
      <div className="reveal-floating-logo">
        <img src={logo} alt={WEBSITE_NAME} />
        <span className="text-muted floating-logo-text">{REACT_APP_VERSION}</span>
      </div>
    );
  }
  return (
    <footer className="footer">
      <hr className="p-0 m-0" />
      <span className="text-muted">
        {REACT_APP_NAME}: {REACT_APP_VERSION}
      </span>
    </footer>
  );
};
