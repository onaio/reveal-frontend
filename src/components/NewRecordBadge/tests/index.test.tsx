import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import NewRecordBadge from '..';

describe('components/NewRecordBadge', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<NewRecordBadge />);
  });
});
