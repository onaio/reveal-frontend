import { mount } from 'enzyme';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import { SuccessfulLoginComponent } from '..';

const App = () => {
  return (
    <Switch>
      <Route exact={true} path="/callback" component={SuccessfulLoginComponent} />
      {/* tslint:disable-next-line: jsx-no-lambda */}
      <Route path="/teams" component={() => <div id="teams" />} />
      {/* tslint:disable-next-line: jsx-no-lambda */}
      <Route path="/plans/update/:id" component={() => <div id="plans" />} />
      {/* tslint:disable-next-line: jsx-no-lambda */}
      <Route path="/" component={() => <div id="home" />} />
    </Switch>
  );
};

describe('src/components/page/CustomCallback.SuccessfulLogin', () => {
  it('renders correctly', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ pathname: `/callback`, search: '', hash: '', state: {} }]}>
        <App />
      </MemoryRouter>
    );
    // should redirect to home
    expect(wrapper.find('#home').length).toEqual(1);
  });

  it('redirects if next page is provided; nominal', () => {
    const wrapper = mount(
      <MemoryRouter
        initialEntries={[{ pathname: `/callback`, search: '?next=%2Fteams', hash: '', state: {} }]}
      >
        <App />
      </MemoryRouter>
    );
    // should redirect to teams
    expect(wrapper.find('#teams').length).toEqual(1);
    expect(wrapper.find('#home').length).toEqual(0);
  });

  it('redirects if next page is provided, tougher case', () => {
    const wrapper = mount(
      <MemoryRouter
        initialEntries={[
          {
            hash: '',
            pathname: `/callback`,
            search: '?next=%2Fplans%2Fupdate%2Fbc78591f-df79-45a7-99e4-c1fbeda629e2',
            state: {},
          },
        ]}
      >
        <App />
      </MemoryRouter>
    );
    // should redirect to plans
    expect(wrapper.find('#plans').length).toEqual(1);
  });
});
