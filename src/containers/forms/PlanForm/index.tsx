import { Field, FieldArray, Formik } from 'formik';
import React from 'react';
import { Alert, Button, Col, Form, FormGroup, FormText, Input, Label, Row } from 'reactstrap';
import { InterventionType } from '../../../store/ducks/plans';

/** HTML element for plan form */
const XForm = () => {
  return (
    <Form>
      <label htmlFor="firstName">First Name</label>
      <Field id="firstName" name="firstName" placeholder="John" type="text" />

      <label htmlFor="lastName">Last Name</label>
      <Field id="lastName" name="lastName" placeholder="Doe" type="text" />

      <label htmlFor="email">Email</label>
      <Field id="email" name="email" placeholder="john@acme.com" type="email" />

      <button type="submit" style={{ display: 'block' }}>
        Submit
      </button>
    </Form>
  );
};

/** Plan Form component */
const PlanForm = () => {
  return (
    <div className="form-container">
      <Formik render={XForm} />
    </div>
  );
};
