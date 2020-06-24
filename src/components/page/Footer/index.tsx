import React from 'react';
import { REACT_APP_VERSION, REVEAL_BRAND_IMG_SRC, WEBSITE_NAME } from '../../../configs/env';

/** footer component; to render react-version on the web ui */
export const Footer = () => {
  return (
    <footer className="footer">
      <hr className="p-0 m-0" />
      {REVEAL_BRAND_IMG_SRC && (
        <>
          <img src={REVEAL_BRAND_IMG_SRC} alt={WEBSITE_NAME} style={{ paddingBottom: '5px' }} />
          &nbsp;
        </>
      )}
      <small className="text-muted">{REACT_APP_VERSION}</small>
    </footer>
  );
};
