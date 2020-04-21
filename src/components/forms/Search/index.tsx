import { History } from 'history';
import React, { useState } from 'react';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { SEARCH } from '../../../configs/lang';

/**
 * Interface for handleSearchChange event handler
 */
export type Change = (event: React.ChangeEvent<HTMLInputElement>) => void;

/**
 * Interface for handleSubmit event handler
 */
export type Submit = (event: React.FormEvent<HTMLFormElement>) => void;

/**
 * Interface for SearchForm props
 */
export interface SearchFormProps {
  history: History;
  placeholder?: string;
}

/** Search Form component */
export const SearchForm = (props: SearchFormProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange: Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit: Submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.history.push({
      search: `?search=${searchQuery}`,
    });
  };

  return (
    <Form inline={true} onSubmit={handleSubmit}>
      <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
        <Input
          type="text"
          name="search"
          placeholder={props.placeholder ? props.placeholder : SEARCH}
          onChange={handleSearchChange}
        />
      </FormGroup>
      <Button outline={true} color="success">
        {SEARCH}
      </Button>
    </Form>
  );
};
