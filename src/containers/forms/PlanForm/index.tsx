import { Field, FieldArray, Formik } from 'formik';
import React from 'react';
import { Alert, Button, Col, Form, FormGroup, FormText, Input, Label, Row } from 'reactstrap';
import { InterventionType } from '../../../store/ducks/plans';

/** HTML element for plan form */
const FormElement = () => {
  return (
    <Form>
      <FormGroup className="row">
        <Label for="interventionType">Intervention Type</Label>
        <Input type="select" name="interventionType" id="interventionType">
          <option value="{InterventionType.FI}">FI</option>
        </Input>
      </FormGroup>
    </Form>
  );
};

/** Plan Form component */
const PlanForm = () => {
  return (
    <div className="form-container">
      <Formik render={FormElement} />
    </div>
  );
};
