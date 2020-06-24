import { fixManifestFiles } from '../../../JSONValidators/tests/fixtures';

export const FixManifestDraftFiles = [
  {
    ...fixManifestFiles[0],
    isDraft: true,
    isJsonValidator: false,
  },
  {
    ...fixManifestFiles[1],
    isDraft: true,
    isJsonValidator: false,
  },
];
