# Redux Modules (aka Ducks)

Ducks are modular Redux reducer bundles inspired by [this proposal](https://github.com/erikras/ducks-modular-redux).

## Rules for Reducer Modules

A reducer module:

1. **MUST** export default a function called reducer()
2. **MUST** export its action creators as functions
3. **MUST** have action types in the form `reveal/reducer/ACTION_TYPE`
4. MAY export its action types as UPPER_SNAKE_CASE, if an external reducer needs to listen for them, or if it is a published reusable library

## Selectors

The above proposal does not cover [selectors](https://redux.js.org/introduction/learning-resources/#selectors). Selectors are getters for the redux state. Like getters, selectors encapsulate the structure of the state, and are reusable. Selectors can also compute derived properties.

Generally, we prefer that:

1. Selectors should be included in the reducer module
2. Selectors should be made using [Reselect](https://github.com/reduxjs/reselect).
