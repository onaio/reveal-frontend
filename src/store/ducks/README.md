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

### Reselect usage

The following is a mini-tutorial that should serve as an introduction to Reselect usage. [Go here for official documentation](https://github.com/reduxjs/reselect).

Start by creating a basic "base selector". Ideally this base selector should be as simple as possible,
and should not do any processing or filtering; it should simply be extracting data from the store.

```ts
export const plansArrayBaseSelector = (planKey?: string) => (state: Registry): Plan[] =>
  values((state as any)[reducerName][planKey ? planKey : 'plansById']);
```

If you anticipate that you will need to filter/process the data further by having your selectors take in parameters, then go ahead and create an interface to describe the kind of parameters you are expecting:

```ts
export interface FancyFilters {
  interventionType?: InterventionType /** The plan intervention type */;
  jurisdictionIds?: string[] /** an array of jurisdiction ids */;
}
```

Next, create really simple functions that simply extract the params, for example:

```ts
// these functions are technically also selectors, but they are getting data from `props`. Notice that the
// first parameter below is unused (it represents the Redux state).
export const getInterventionType = (_: Registry, props: PlanFilters) => props.interventionType;
export const getJurisdictionIds = (_: Registry, props: PlanFilters) => props.jurisdictionIds;
```

Finally, you can now actually use Reselect's `createSelector` to define your memoized selectors:

```ts
// these functions accepts one optional parameter:
//   1.the planKey, a key of plans object
// the functions return a selector definitions.
// these selector definitions will result in selector functions that accept two inputs:
//   1. the state, the global Redux state
//   2. the props, in this case an object of shape FancyFilters
export const getPlansArrayByInterventionType = (planKey?: string) =>
  createSelector(
    [plansArrayBaseSelector(planKey), getInterventionType],
    (plans, interventionType) =>
      interventionType
        ? plans.filter(plan => plan.plan_intervention_type === interventionType)
        : plans
  );
export const getPlansArrayByJurisdictionIds = (planKey?: string) =>
  createSelector(
    [plansArrayBaseSelector(planKey), getJurisdictionIds],
    (plans, jurisdictionIds) =>
      jurisdictionIds
        ? plans.filter(plan =>
            jurisdictionIds.length ? jurisdictionIds.includes(plan.jurisdiction_id) : true
          )
        : plans
  );
```

You can compose your selectors by combining them, like so:

```ts
export const makeComplexSelector = (planKey?: string) => {
  // this is our actual selector definition
  return createSelector(
    // the first argument is an array of the selectors that you are combining
    [getPlansArrayByInterventionType(planKey), getPlansArrayByJurisdictionIds(planKey)],
    (
      plans,
      plans2 // the 2nd argument is a callback function that takes the results of the 1st arguments
    ) => intersect([plans, plans2], JSON.stringify)
  );
};
```

Note that `makeComplexSelector` above simply returns a selector. This is useful when you want to [create shareable memoized selectors](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances). This is recommended whenever your selectors take in params, like the selectors defined above.
