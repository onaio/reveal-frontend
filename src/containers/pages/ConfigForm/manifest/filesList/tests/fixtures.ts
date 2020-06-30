import { fixManifestFiles as files } from '../../../JSONValidators/tests/fixtures';

export const FixManifestFiles = [
  {
    ...files[0],
    isJsonValidator: false,
  },
  {
    ...files[1],
    isJsonValidator: false,
  },
];
