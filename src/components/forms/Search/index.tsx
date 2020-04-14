import React from 'react';
import { Form, FormGroup, Input } from 'reactstrap';

export type SearchChange = (event: React.ChangeEvent<HTMLInputElement>) => void;

/** Interface for SearchForm props */
export interface SearchFormProps {
  handleSearchChange: SearchChange;
}

export const SearchForm = (props: SearchFormProps) => {
  return (
    <Form inline={true}>
      <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
        <Input type="text" name="search" placeholder="Search" onChange={props.handleSearchChange} />
      </FormGroup>
    </Form>
  );
};
