import { Field, FieldArray, Formik } from 'formik';
import React from 'react';
import { Alert, Button, Col, Form, FormGroup, FormText, Input, Label, Row } from 'reactstrap';
import { InterventionType } from '../../../store/ducks/plans';

/** Plan Form component */
const PlanForm = () => {
  return (
    <div className="form-container">
      <Formik />
    </div>
  );
};
