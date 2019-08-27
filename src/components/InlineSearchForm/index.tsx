/** renders a form inline, containing search field and search button */
import React, { FormEvent } from 'react';
import { Button, Form, FormGroup, Input } from 'reactstrap';

interface Props {
  handleSubmit?: (e: FormEvent) => void;
  inputId: string;
  inputPlaceholder: string;
}

const defaultProps: Props = {
  inputId: 'search',
  inputPlaceholder: 'Search',
};

const InlineSearchForm = (props: Props) => {
  const { handleSubmit, inputPlaceholder, inputId } = props;
  return (
    <Form inline={true} onSubmit={handleSubmit}>
      <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
        <Input type="text" name="search" id={inputId} placeholder={inputPlaceholder} />
      </FormGroup>
      <Button type="submit" outline={true} color="success">
        Search
      </Button>
    </Form>
  );
};

InlineSearchForm.defaultProps = defaultProps;

export default InlineSearchForm;
