import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { PAGE_NOT_FOUND, PAGE_NOT_FOUND_ERROR_MESSAGE } from '../../configs/lang';

/**
 * Fallback
 *
 * This component is meant to be displayed in case an unrecoverable error is
 * encountered, instead of the component tree that crashed.
 *
 */
export const PageNotFound = () => {
  return (
    <Container fluid={true}>
      <Row style={{ marginTop: '40px' }} className="text-center">
        <Col sm="12" md={{ size: 4, offset: 4 }}>
          <h1>{PAGE_NOT_FOUND}</h1>
          <div>
            <p>{PAGE_NOT_FOUND_ERROR_MESSAGE}</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
