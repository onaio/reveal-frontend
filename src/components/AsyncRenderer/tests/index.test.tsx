import { mount, shallow } from 'enzyme';
import React from 'react';
import { AsyncState, PromiseFn } from 'react-async';
import { AsyncRenderer } from '..';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

/** hasPrePopulatedData is meant to represent when there is some data
 * that the component can readily consume as a fetch request to get more data is
 * pending.
 */
interface TestComponentProps {
  hasPrePopulatedData: boolean;
}
const defaultTestComponentProps = {
  hasPrePopulatedData: false,
};
const TestComponent = (props: TestComponentProps = defaultTestComponentProps) => {
  interface PromiseFnProps {
    otherNumber: number;
  }
  const samplePromiseFn: PromiseFn<number[]> = async (
    { otherNumber },
    { signal }: AbortController
  ) =>
    fetch('https://someUrl.org', signal)
      .then(() => [otherNumber])
      .catch(() => [400]);

  const asyncRendererProps = {
    data: props.hasPrePopulatedData ? [100] : [],
    ifFulfilledRender: ({ data }: AsyncState<number[]>) => <p>Promise Resolved with {data}</p>,
    ifLoadingRender: () => <p>Promise Pending</p>,
    promiseFn: samplePromiseFn,
    promiseFnProps: { otherNumber: 200 },
  };

  return (
    <div>
      <AsyncRenderer<number, PromiseFnProps> {...asyncRendererProps} />
      );
    </div>
  );
};

describe('src/components/AsyncRenderer', () => {
  it('renders without crashing', () => {
    // its a type thing too
    interface PromiseFnProps {
      otherNumber: number;
    }
    const samplePromiseFn: PromiseFn<number[]> = async ({ otherNumber }) => {
      return [otherNumber];
    };

    const props = {
      data: [1],
      ifFulfilledRender: () => <p>Promise Resolved</p>,
      ifLoadingRender: () => <p>Promise Pending</p>,
      promiseFn: samplePromiseFn,
      promiseFnProps: { otherNumber: 5 },
    };

    shallow(<AsyncRenderer<number, PromiseFnProps> {...props} />);
  });

  it('AsyncRenderer loads correctly', async () => {
    fetch.once(JSON.stringify([200]));
    const wrapper = mount(<TestComponent hasPrePopulatedData={false} />);
    // before fetch is resolved; we should see content rendered by the ifPending render prop
    expect(wrapper.text()).toMatchSnapshot('before promise resolution');
    expect(wrapper.text().includes('Pending')).toEqual(true);
    expect(wrapper.text().includes('Resolved')).toEqual(false);
    await new Promise(resolve => setImmediate(resolve));
    // upon flushing pending promises; we should now see content rendered by the ifFulfilled render prop
    expect(wrapper.text()).toMatchSnapshot('after Promise resolution');
    expect(wrapper.text().includes('Pending')).toEqual(false);
    expect(wrapper.text().includes('Resolved')).toEqual(true);
  });

  it('Does not load when there is pre-populated data', async () => {
    // this simulates a condition such as when there is already data in the store
    fetch.once(JSON.stringify([200]));
    const wrapper = mount(<TestComponent hasPrePopulatedData={true} />);
    // before the promise is resolved we render the initial data which is a [100]
    expect(wrapper.text()).toMatchSnapshot('before promise resolution');
    await new Promise(resolve => setImmediate(resolve));
    // after promise resolution we know render the fetched data which is [200]
    expect(wrapper.text()).toMatchSnapshot('after Promise resolution');
  });
});
