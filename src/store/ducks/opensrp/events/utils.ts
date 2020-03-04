import { Dictionary } from 'lodash';
import { FOCI_OF_INFECTION, FOCI_OF_RESIDENCE } from '../../../../configs/lang';
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
  id: UUID;
  classification: string;
  name: string;
  title: string;
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
  fociInformation: FociInformation;
}

const FociTitleLookup: Dictionary<string> = {
  Site: FOCI_OF_RESIDENCE,
  Source: FOCI_OF_INFECTION,
};

export const extractEvent = (rawEvent: RawEvent): Event => ({
  age: rawEvent.details.age,
  baseEntityId: rawEvent.baseEntityId,
  caseClassification: rawEvent.details.case_classification,
  caseNumber: rawEvent.details.case_number,
  diagnosisDate: rawEvent.details.ep3_create_date,
  fociInformation: {
    classification: rawEvent.details.focus_status,
    id: rawEvent.details.focus_id,
    name: rawEvent.details.focus_name,
    title: FociTitleLookup[rawEvent.details.flag],
  },
  houseNumber: rawEvent.details.house_number,
  investigationDate: rawEvent.details.investigtion_date,
  notificationDate: rawEvent.details.ep1_create_date,
  patientName: rawEvent.details.first_name,
  species: rawEvent.details.species,
  surname: rawEvent.details.surname,
});

export const extractEvents = (rawEvents: RawEvent[]): Event[] => {
  return rawEvents.map<Event>(rawEvent => extractEvent(rawEvent));
};
