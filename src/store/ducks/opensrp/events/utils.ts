import { FlexObject } from '../../../../helpers/utils';

export type UUID = string;
export type DateString = string;
export type TimeStamp = number;

export interface RawEvent extends FlexObject {
  type: 'Event';
  dateCreated: TimeStamp;
  serverVersion: number;
  identifiers: FlexObject;
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
  id: string;
  classification: string;
  name: string;
}

export interface Event {
  baseEntityId: string;
  caseClassification: string;
  caseNumber: string;
  diagnosisDate: DateString;
  species: string;
  notificationDate: DateString;
  investigationDate: DateString;
  houseNumber: string;
  patientName: string;
  surname: string;
  age: string;
  fociInformation: {
    residenceFoci: FociInformation;
    infectionFoci: FociInformation;
  };
}

export const extractEvent = (rawEvent: RawEvent): Event => ({
  age: rawEvent.details.age,
  baseEntityId: rawEvent.baseEntityId,
  caseClassification: rawEvent.details.focus_status,
  caseNumber: rawEvent.details.case_number,
  diagnosisDate: rawEvent.eventDate,
  fociInformation: {
    infectionFoci: {},
    residenceFoci: {},
  },
  houseNumber: rawEvent.details.house_number,
  investigationDate: rawEvent.details.investigtion_date,
  notificationDate: '',
  patientName: rawEvent.details.first_name,
  species: rawEvent.details.species,
});

export const extractEvents = (rawEvents: RawEvent[]): Event[] => {
  return rawEvents.map<Event>(rawEvent => extractEvent(rawEvent));
};
