import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { AN_ERROR_OCCURRED, FALLBACK_CUSTOM_ERROR_MESSAGE } from '../../configs/lang';

/**
 * Fallback
 *
 * This component is meant to be displayed in case an unrecoverable error is
 * encountered, instead of the component tree that crashed.
 *
 */
export const Fallback = () => {
  return (
    <Container
      fluid={true}
      style={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <Row style={{ marginTop: '40px' }} className="text-center">
        <Col sm="12" md={{ size: 4, offset: 4 }}>
          <h1>{AN_ERROR_OCCURRED}</h1>
          <div>
            <p>{FALLBACK_CUSTOM_ERROR_MESSAGE}</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
