import { Dictionary } from 'lodash';
import moment from 'moment';
import {
  AGE,
  CASE_CLASSIFICATION_HEADER,
  CASE_NOTIF_DATE_HEADER,
  CLASSIFICATION,
  DIAGNOSIS_DATE,
  FOCI_OF_INFECTION,
  FOCI_OF_RESIDENCE,
  HOUSE_NUMBER,
  INVESTIGATION_DATE,
  NAME,
  PATIENT_NAME,
  SPECIES,
  SURNAME,
} from '../../../../configs/lang';

export type UUID = string;
export type DateString = string;
export type TimeStamp = number;

export interface RawEvent {
  type: 'Event';
  dateCreated: TimeStamp;
  serverVersion: number;
  identifiers: Dictionary<string>;
  baseEntityId: UUID;
  locationId: UUID;
  eventDate: TimeStamp;
  eventType: 'Case Details';
  formSubmissionId: UUID;
  providerId: string;
  duration: number;
  obs: object[];
  entityType: 'Case Details';
  details: {
    id: string;
    age: string;
    bfid: string;
    flag: string;
    species: string;
    surname: string;
    focus_id: UUID;
    first_name: string;
    focus_name: string;
    case_number: string;
    family_name: string;
    focus_reason: string;
    focus_status: string;
    house_number: string;
    ep1_create_date: DateString;
    ep3_create_date: DateString;
    investigtion_date: DateString;
    case_classification: string;
  };
  version: number;
  teamId: UUID;
  _id: UUID;
  _rev: string;
}

interface FociInformation {
  id: UUID;
  classification: string;
  name: string;
}

export interface CaseInformation {
  caseClassification: string;

  diagnosisDate: DateString;
  species: string;
  notificationDate: DateString;
  investigationDate: DateString;
  houseNumber: string;
  patientName: string;
  surname: string;
  age: string;
}

export interface Event {
  id: UUID;
  baseEntityId: UUID;
  caseNumber: string;
  caseInformation: CaseInformation;
  fociInformation: FociInformation;
  fociInformationTitle: string;
}

const FociTitleLookup: Dictionary<string> = {
  Site: FOCI_OF_RESIDENCE,
  Source: FOCI_OF_INFECTION,
};

export const friendlyDate = (dateString: DateString): string => {
  return moment(dateString).format('YYYY-MM-DD');
};

export const extractEvent = (rawEvent: RawEvent): Event => ({
  baseEntityId: rawEvent.baseEntityId,
  caseInformation: {
    age: rawEvent.details.age,
    caseClassification: rawEvent.details.case_classification,
    diagnosisDate: friendlyDate(rawEvent.details.ep3_create_date),
    houseNumber: rawEvent.details.house_number,
    investigationDate: friendlyDate(rawEvent.details.investigtion_date),
    notificationDate: friendlyDate(rawEvent.details.ep1_create_date),
    patientName: rawEvent.details.first_name,
    species: rawEvent.details.species,
    surname: rawEvent.details.surname,
  },
  caseNumber: rawEvent.details.case_number,
  fociInformation: {
    classification: rawEvent.details.focus_status,
    id: rawEvent.details.focus_id,
    name: rawEvent.details.focus_name,
  },
  fociInformationTitle: FociTitleLookup[rawEvent.details.flag],
  id: rawEvent._id,
});

export const extractEvents = (rawEvents: RawEvent[]): Event[] => {
  return rawEvents.map<Event>(rawEvent => extractEvent(rawEvent));
};

interface TranslatedEvent {
  baseEntityId: UUID;
  caseInformation: Dictionary<string>;
  caseNumber: string;
  fociInformation: Dictionary<string>;
  fociInformationTitle: string;
}

export const translateEvent = (event: Event): TranslatedEvent => {
  const { caseInformation, fociInformation } = event;
  return {
    baseEntityId: event.baseEntityId,
    caseInformation: {
      [AGE]: caseInformation.age,
      [CASE_CLASSIFICATION_HEADER]: caseInformation.caseClassification,
      [DIAGNOSIS_DATE]: caseInformation.diagnosisDate,
      [HOUSE_NUMBER]: caseInformation.houseNumber,
      [INVESTIGATION_DATE]: caseInformation.investigationDate,
      [CASE_NOTIF_DATE_HEADER]: caseInformation.notificationDate,
      [PATIENT_NAME]: caseInformation.patientName,
      [SPECIES]: caseInformation.species,
      [SURNAME]: caseInformation.surname,
    },
    caseNumber: event.caseNumber,
    fociInformation: {
      [CLASSIFICATION]: fociInformation.classification,
      id: fociInformation.id,
      [NAME]: fociInformation.name,
    },
    fociInformationTitle: event.fociInformationTitle,
  };
};
