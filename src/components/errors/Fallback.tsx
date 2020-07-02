import React from 'react';
import { Col, Container, Row } from 'reactstrap';

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
          <h1>An Error Occurred</h1>
          <div>
            <p>
              There has been an error. It’s been reported to the site administrators via email and
              should be fixed shortly. Thanks for your patience.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
