# Redux Modules (aka Ducks)

Ducks are modular Redux reducer bundles inspired by [this proposal](https://github.com/erikras/ducks-modular-redux).

## Rules for Reducer Modules

A reducer module:

1. **MUST** export default a function called reducer()
2. **MUST** export its action creators as functions
3. **MUST** have action types in the form `reveal/reducer/ACTION_TYPE`
4. MAY export its action types as UPPER_SNAKE_CASE, if an external reducer needs to listen for them, or if it is a published reusable library
