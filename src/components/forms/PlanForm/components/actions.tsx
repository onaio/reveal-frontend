import { Dictionary } from '@onaio/utils';
import { Field } from 'formik';
import React from 'react';
import { FormGroup, Label } from 'reactstrap';
import { PlanActivityFormFields } from '../helpers';

export const getConditionAndTriggers = (planActivities: PlanActivityFormFields[]) => {
  // This is still WIP
  const conditions: Dictionary = {};
  const triggers: Dictionary = {};
  for (let index = 0; index < planActivities.length; index++) {
    const element = planActivities[index];
    if (element.condition) {
      conditions[element.actionCode] = element.condition.map((item, mapIndex) => {
        return (
          <React.Fragment key={`${element.actionCode}-${index}-condition-${mapIndex}`}>
            {item.expression && (
              <FormGroup>
                <Label for={`activities[${index}].condition[${mapIndex}].expression`}>
                  Condition
                </Label>
                <Field
                  className="form-control"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].condition[${mapIndex}].expression`}
                  id={`activities[${index}].condition[${mapIndex}].expression`}
                />
              </FormGroup>
            )}
            {item.description && (
              <FormGroup>
                <Label for={`activities[${index}].condition[${mapIndex}].description`}>
                  Description
                </Label>
                <Field
                  className="form-control"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].condition[${mapIndex}].description`}
                  id={`activities[${index}].condition[${mapIndex}].description`}
                />
              </FormGroup>
            )}
          </React.Fragment>
        );
      });
    }
    if (element.trigger) {
      triggers[element.actionCode] = element.trigger.map((item, mapIndex) => {
        return (
          <React.Fragment key={`${element.actionCode}-${index}-trigger-${mapIndex}`}>
            {item.name && (
              <FormGroup>
                <Label for={`activities[${index}].trigger[${mapIndex}].name`}>Name</Label>
                <Field
                  className="form-control"
                  required={true}
                  type="text"
                  name={`activities[${index}].trigger[${mapIndex}].name`}
                  id={`activities[${index}].trigger[${mapIndex}].name`}
                />
              </FormGroup>
            )}
            {item.description && (
              <FormGroup>
                <Label for={`activities[${index}].trigger[${mapIndex}].expression`}>
                  Condition
                </Label>
                <Field
                  className="form-control"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].trigger[${mapIndex}].expression`}
                  id={`activities[${index}].trigger[${mapIndex}].expression`}
                />
              </FormGroup>
            )}
            {item.expression && (
              <FormGroup>
                <Label for={`activities[${index}].trigger[${mapIndex}].description`}>
                  Description
                </Label>
                <Field
                  className="form-control"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].trigger[${mapIndex}].description`}
                  id={`activities[${index}].trigger[${mapIndex}].description`}
                />
              </FormGroup>
            )}
          </React.Fragment>
        );
      });
    }
  }
  return {
    conditions,
    triggers,
  };
};
