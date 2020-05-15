import React from 'react';
import { REACT_APP_NAME, REACT_APP_VERSION } from '../../../configs/env';
import './footer.css';

jest.mock('../../../configs/env');

/** footer component; to render react-version on the web ui */
export const Footer = () => {
  return (
    <footer className="footer">
      <span className="text-muted">
        {REACT_APP_NAME}: {REACT_APP_VERSION}
      </span>
    </footer>
  );
};
