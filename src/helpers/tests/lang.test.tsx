import { keys } from 'lodash';
import * as lang from '../../configs/lang';
import { translate } from '../../configs/lang';

jest.mock('../../configs/env');

describe('configs/lang', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('translates display strings', () => {
    expect(translate('WELCOME_TO_REVEAL', 'foo baz')).toBe('Welcome to Reveal');
  });

  it('falls back to english translations', () => {
    expect(translate('foo baz', 'Welcome to Reveal')).toBe('Welcome to Reveal');
  });
});
