import React, { PropsWithChildren } from 'react';
import { AsyncState, IfFulfilled, IfPending, PromiseFn, useAsync } from 'react-async';
import { PLEASE_PROVIDE_CUSTOM_COMPONENT_TO_RENDER } from '../../constants';
import Loading from '../page/Loading';

/** props for AsyncRender component */
export interface AsyncRendererProps<TData, TPromiseFunctionProps> {
  data: TData[] /** interface describing data to be consumed by render component */;
  promiseFn: PromiseFn<TData[]> /** react-async-type asynchronous function */;
  promiseFnProps: TPromiseFunctionProps /** options to be passed to promiseFn */;
  ifLoadingRender: (
    state: AsyncState<TData[]>
  ) => React.ReactNode /** renderProp invoked while promise returned by promiseFn is pending */;
  ifFulfilledRender: (
    state: AsyncState<TData[]>
  ) => React.ReactNode /** renderProp invoked after promise returned by promiseFn is fulfilled */;
}

// tslint:disable-next-line: no-empty-destructuring
const defaultPromiseFn = async ({}) => [];

/** default props for AsyncRenderer */
const defaultAsyncRenderProps: AsyncRendererProps<any, any> = {
  data: [],
  ifFulfilledRender: () => <div>{PLEASE_PROVIDE_CUSTOM_COMPONENT_TO_RENDER}</div>,
  ifLoadingRender: () => <Loading />,
  promiseFn: defaultPromiseFn,
  promiseFnProps: {},
};

/** helps Dry out trivial react-async rendering */
export const AsyncRenderer = <TData, TPromiseFunctionProps>({
  data,
  ifFulfilledRender,
  ifLoadingRender,
  promiseFn,
  promiseFnProps,
}: PropsWithChildren<
  AsyncRendererProps<TData, TPromiseFunctionProps>
> = defaultAsyncRenderProps) => {
  const loadPractitionersState = useAsync<TData[]>(promiseFn, promiseFnProps);

  React.useEffect(() => {
    if (data.length > 0) {
      loadPractitionersState.setData(data);
    }
  }, []);

  return (
    <>
      <IfPending state={loadPractitionersState}>
        {ifLoadingRender(loadPractitionersState)}
      </IfPending>
      <IfFulfilled state={loadPractitionersState}>
        {ifFulfilledRender(loadPractitionersState)}
      </IfFulfilled>
    </>
  );
};
