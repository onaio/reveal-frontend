# TreeWalker

This is a set of utilities that together provide functionality to traverse up and down the OpenSRP jurisdictions tree.

## withTreeWalker

`withTreeWalker` is a higher order component that takes a regular component as an input, and adds tree walking super powers to it. :)

```tsx
interface SomeProps extends WithWalkerProps {
  smile: string;
}

const SomeComponent = withTreeWalker<SomeProps>(() => <div>I Love Oov</div>);

// then use it like this:
<SomeComponent jurisdictionId={someJurisdiction.id} limits={limitTree} smile=":-)" />;
```

`withTreeWalker` will pass all the original props to the wrapped component (that would be `SomeComponent` in the example above). But, crucially, it adds other props which are the result of jurisdiction tree-walking:

- currentNode: the current jurisdiction
- currentChildren: the current jurisdiction's children
- hierarchy: the full path to the current jurisdiction, ordered from the root parent, all the way to the current jurisdiction
- loadChildren: a callback that when called loads the children of the desired jurisdiction. Usually it will be called with an input being one of the elements in the `currentChildren` array, and would result in tree traversal to view that element's children.

These 4 props keep on changing as you go up and down the jurisdiction tree to allow the wrapped component to react to the changes. Basically, `withTreeWalker` provides any old component the ability to traverse and react to OpenSRP jurisdictions tree traversal in a generic way.

## Helpers

### getAncestors

This function is able to recursively call the OpenSRP location API to get all the ancestors of a given jurisdictions.

```ts
getAncestors(someJurisdiction);
// returns something like [rootParent, grandParent, immediateParent]
```

### getChildren

This function is able to get the children jurisdictions of the provided input jurisdiction.

```ts
getChildren(urlParams, someJurisdiction);
// returns something like [child1, child2, child3]
```

The function can optionally take a third parameter - a hierarchy of jurisdictions, which would limit the children returned to only those found within the provided hierarchy. This might be useful, when doing things like traversing down a plan's jurisdiction hierarchy to get jurisdiction geometries - in which case you would not want any other children returned but only those within the plan hierarchy.

An interesting thing to note is that this function's only required parameter is its first one which is an object containing the URL parameters to send to the OpenSRP API for the locations "findByProperties" endpoint. Indeed it is possible to get children only using this parameter i.e. the jurisdiction (2nd param) is optional!

## Read the code

For more, and for specific details on what parameters all the above take, we encourage you to read the code. It is also just good practice.
