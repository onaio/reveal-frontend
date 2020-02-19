import { Registry } from '@onaio/redux-reducer-registry';
import React from 'react';
import { connect } from 'react-redux';
import { ActionCreator } from 'redux';

/** interface to describe ObjectList options */
export interface ObjectListOptions<TAction, TSelector> {
  actionCreator: ActionCreator<TAction>;
  listPropName: string;
  dispatchPropName: string;
  selector: TSelector;
}

/** interface for the props of the connected component created by ObjectList  */
interface ObjectListProps<TAction, TObject> {
  actionCreator: TAction;
  objectList: TObject[];
}

/**
 * ObjectList class
 *
 * This class is initialized with the following parameters:
 *    - component: a react component
 *    - options: an object representing options for ObjectList
 *
 * The class's render method will then return the same component wrapped in a
 * higher order component that has been connected to the redux store, and which
 * knows how to fetch data for display.
 *
 * The end goal is a quick and convenient way to display a list of objects without
 * having to worry about boilerplate code that deal with fetching objects and
 * storing them in a Redux store.
 *
 * Every method in this class can and should be overridden to cater to custom needs.
 */
export class ObjectList<ObjectType, ActionType, SelectorType, PropsType, RootState = Registry> {
  public Component: React.ElementType;
  public options: ObjectListOptions<ActionType, SelectorType>;

  /** constructor */
  constructor(component: React.ElementType, options: ObjectListOptions<ActionType, SelectorType>) {
    this.Component = component;
    this.options = options;
  }

  /**
   * This function returns a Higher Order component whose job is to wrap around
   * the target component, and pass on props to it.  The props in this case are:
   *     - the list of objects to be displayed
   *     - the action creator dispatch function
   */
  public getHOC() {
    return (props: ObjectListProps<ActionType, ObjectType>) => {
      return <this.Component {...props} />;
    };
  }

  /**
   * The mapDispatchToProps function
   * You may override this for more custom needs.
   */
  public getMapDispatchToProps() {
    return { [this.options.dispatchPropName]: this.options.actionCreator };
  }

  /**
   * The mapStateToProps function
   * You may override this for more custom needs.
   */
  public getMapStateToProps() {
    return (state: RootState, ownProps: PropsType) => {
      // we have to use a Type Guard to check if this.options.selector is a
      // callable/function otherwise Typescript will infer its type as "unknown"
      // TODO: look into whether there is a better fix for this
      if (typeof this.options.selector === 'function') {
        return {
          [this.options.listPropName]: this.options.selector(state, ownProps),
        };
      }
      // if the TypeGuard fails lets return an empty array
      return { [this.options.listPropName]: [] };
    };
  }

  /**
   * This function simply connects the Higher Order Component to the redux
   * store.
   */
  public getConnectedHOC() {
    /** map dispatch to props */
    const mapDispatchToProps = this.getMapDispatchToProps();
    /** map state to props */
    const mapStateToProps = this.getMapStateToProps();
    /** connect to store */
    return connect(
      mapStateToProps,
      mapDispatchToProps
    )(this.getHOC());
  }

  /**
   * This function returns the connected higher order component.
   */
  public render() {
    return this.getConnectedHOC();
  }
}
