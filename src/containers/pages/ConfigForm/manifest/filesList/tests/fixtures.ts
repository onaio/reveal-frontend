import { fixManifestFiles } from '../../../JSONValidators/tests/fixtures';

export const FixManifestReleaseFiles = [
  {
    ...fixManifestFiles[0],
    isJsonValidator: false,
  },
  {
    ...fixManifestFiles[1],
    isJsonValidator: false,
  },
];
