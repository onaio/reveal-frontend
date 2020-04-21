import { History, Location } from 'history';
import { trimStart } from 'lodash';
import querystring from 'querystring';
import React, { useEffect, useState } from 'react';
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
  location: Location;
  placeholder?: string;
}

/** Search Form component */
export const SearchForm = (props: SearchFormProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const searchString = trimStart(props.location.search, '?');
    const queryParams = querystring.parse(searchString);
    const searchedTitle = queryParams.search as string;
    setSearchQuery(searchedTitle);
  }, []);

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
          value={searchQuery}
        />
      </FormGroup>
      <Button outline={true} color="success">
        {SEARCH}
      </Button>
    </Form>
  );
};
