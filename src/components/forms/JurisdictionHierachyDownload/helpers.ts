import Papaparse from 'papaparse';
import {
  FILE_DOWNLOADED_SUCCESSFULLY,
  JURISDICTION_HIERARCHY_TEMPLATE,
  STRUCTURE_HIERARCHY_TEMPLATE,
} from '../../../configs/lang';
import { TEXT_PLAIN } from '../../../constants';
import { downloadFile, successGrowl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import { RawOpenSRPHierarchy, TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
import { generateJurisdictionTree } from '../../../store/ducks/opensrp/hierarchies/utils';

/** jurisdictions form interface */
export interface JurisdictionHierachyFile {
  jurisdiction_id: string;
  jurisdiction_name: string;
}

/** interface for each select dropdown option */
export interface Option {
  id: string;
  name: string;
}

/** interface for each select dropdown option */
export interface JurisdictionHierachyDownloadFormFields {
  jurisdictions: Option;
}

/** form submit function */
export type FormSubmit = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  serviceClass: OpenSRPService,
  values: JurisdictionHierachyDownloadFormFields
) => void;

/**
 * interface for the Jurisdiction hierarchy download form fields
 */
export interface JurisdictionHierachyDownloadFormProps {
  serviceClass: OpenSRPService;
  initialValues: JurisdictionHierachyDownloadFormFields;
  submitForm: FormSubmit;
}

/** structure properties payload interface */
export interface StructureMetadataProperties {
  externalId: string;
  geographicLevel: number;
  name: string;
  parentId: string;
  status: string;
  version: number;
}

/** structure properties payload interface */
export interface StructureMetadataGeometries {
  coordinates: number[][][] | number[];
  type: string;
}

/** structure payload interface */
export interface StructureMetadataPayload {
  geometry: StructureMetadataGeometries;
  id: string;
  properties: StructureMetadataProperties;
  serverVersion: number;
  type: string;
}

// Create csv data for the selected jurisdiction hieracrhy
const createCsv = (entries: JurisdictionHierachyFile[], fileName: string): void => {
  const csv: string = Papaparse.unparse(entries, {
    header: true,
  });
  // Export csv file
  downloadFile(csv, fileName, TEXT_PLAIN);
};

/**
 * get jurisdictions hierachy
 * @param {(isSubmitting: boolean) => void} setSubmitting - form submiting function
 * @param {(errorMessage: string) => void} setGlobalError -error function
 * @param {OpenSRPService} serviceClass - opensrp service class
 * @param {JurisdictionHierachyDownloadFormFields} values - form values
 */
export const submitJurisdictionHierachyForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  serviceClass: OpenSRPService,
  values: JurisdictionHierachyDownloadFormFields
): void => {
  const params = {
    return_structure_count: false,
  };
  serviceClass
    .read(values.jurisdictions.id, params)
    .then((response: RawOpenSRPHierarchy) => {
      const records: JurisdictionHierachyFile[] = [];
      if (response) {
        const tree: TreeNode = generateJurisdictionTree(response);
        if (tree) {
          tree.walk((node: TreeNode) => {
            records.push({
              jurisdiction_id: node.model.id,
              jurisdiction_name: node.model.label,
            } as JurisdictionHierachyFile);
            return true;
          });
          createCsv(records, `${JURISDICTION_HIERARCHY_TEMPLATE}.csv`);
          successGrowl(FILE_DOWNLOADED_SUCCESSFULLY);
          setSubmitting(false);
        }
      } else {
        setSubmitting(false);
      }
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};

/**
 * get structures hierachy
 * @param {(isSubmitting: boolean) => void} setSubmitting - form submiting function
 * @param {(errorMessage: string) => void} setGlobalError -error function
 * @param {OpenSRPService} serviceClass - opensrp service class
 * @param {JurisdictionHierachyDownloadFormFields} values - form values
 */
export const submitStructureHierachyForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  serviceClass: OpenSRPService,
  values: JurisdictionHierachyDownloadFormFields
): void => {
  const params = { id: values.jurisdictions.id };
  serviceClass
    .list(params)
    .then((res: StructureMetadataPayload[]) => {
      const records: JurisdictionHierachyFile[] = res.map(record => {
        return {
          jurisdiction_id: record.id,
          jurisdiction_name: record.properties.name,
        };
      });
      const jurisdictionName = values.jurisdictions.name;
      const fileName = jurisdictionName
        ? `${jurisdictionName}_${STRUCTURE_HIERARCHY_TEMPLATE}`
        : STRUCTURE_HIERARCHY_TEMPLATE;
      createCsv(records, `${fileName}.csv`);
      successGrowl(FILE_DOWNLOADED_SUCCESSFULLY);
      setSubmitting(false);
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};
