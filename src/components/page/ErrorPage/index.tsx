import React from 'react';
import { AN_ERROR_OCURRED, THE_SPECIFIC_ERROR_IS } from '../../../configs/lang';

export interface Props {
  errorMessage: string;
}

export const defaultProps = {
  errorMessage: '',
};

/** a simple error page */
const ErrorPage = (props: Props) => {
  const { errorMessage } = props;
  return (
    <div className="global-error-container">
      <p>{AN_ERROR_OCURRED}</p>
      {errorMessage && (
        <p>
          {THE_SPECIFIC_ERROR_IS}: <span className="text-danger">{errorMessage}</span>
        </p>
      )}
    </div>
  );
};

ErrorPage.defaultProps = defaultProps;

export { ErrorPage };
