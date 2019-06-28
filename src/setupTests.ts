// This is used to set up stuff for tests e.g. configs, icons, etc
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({ adapter: new Adapter() });
library.add(faMap);
library.add(faUser);

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
