// This is used to set up stuff for tests e.g. configs, icons, etc
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faExternalLinkSquareAlt, faMap } from '@fortawesome/free-solid-svg-icons';
import '@testing-library/jest-dom';
import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import MockDate from 'mockdate';

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
/* tslint:disable-next-line no-var-requires */
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

MockDate.set('2017-07-13T19:31:00.000Z'); // 7-13-17 19:31 => Mersenne primes :)

enzyme.configure({ adapter: new Adapter() });
library.add(faMap);
library.add(faUser);
library.add(faExternalLinkSquareAlt);

window.maps = [
  {
    _container: {
      id: 'map-1',
    },
    isStyleLoaded: true,
  } as any,
];

(window.URL as any) = {
  createObjectURL: () => 'https://example.com',
};

window.__PRELOADED_STATE__ = { random: 'Preloaded state, baby!' };
