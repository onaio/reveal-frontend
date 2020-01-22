import en from './en.json';
import sw from './sw.json';
import th from './th.json';

export interface Translation {
  description: string;
  message: string;
}

export interface Reference {
  [key: string]: Translation;
}

export interface Strings {
  [key: string]: Reference;
}

export default {
  en,
  sw,
  th,
} as Strings;
