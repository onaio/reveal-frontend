import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'student';

/** Interface for student json object */
export interface Student {
  age: number; // the age of the student (for reporting)
  identifier: string; // the baseEntityId of the student
  groupIdentifier: string; // the location id of the distribution point
}

// actions

/** action type for fetching students */
export const STUDENTS_FETCHED = 'opensrp/reducer/students/STUDENTS_FETCHED';
/** action type for removing students */
export const REMOVE_STUDENTS = 'opensrp/reducer/students/REMOVE_STUDENTS';

/** interface action to add Students to store */
export interface FetchStudentsAction extends AnyAction {
  overwrite: boolean;
  studentsById: { [key: string]: Student };
  type: typeof STUDENTS_FETCHED;
}

/** Interface for removeStudentsAction */
export interface RemoveStudentsAction extends AnyAction {
  studentsById: {};
  type: typeof REMOVE_STUDENTS;
}

/** Create type for students reducer actions */
export type StudentActionTypes = FetchStudentsAction | RemoveStudentsAction | AnyAction;

// action Creators

/** Fetch students action creator
 * @param {Practitioner []} studentsList - students array to add to store
 * @param {Student[]} studentsList - students array to add to store
 * @param {boolean} overwrite - whether to replace the records in store for students
 * @return {FetchStudentsAction} - an action to add students to redux store
 */
export const fetchStudents = (
  studentsList: Student[] = [],
  overwrite: boolean = false
): FetchStudentsAction => ({
  overwrite,
  studentsById: keyBy(studentsList, (student: Student) => student.identifier),
  type: STUDENTS_FETCHED,
});

// actions

/** removeStudentsAction action */
export const removeStudentsAction = {
  studentsById: {},
  type: REMOVE_STUDENTS,
};

// The reducer

/** interface for students state in redux store */
export interface StudentState {
  studentsById: { [key: string]: Student } | {};
}

/** Create an immutable students state */
export type ImmutableStudentState = StudentState & SeamlessImmutable.ImmutableObject<StudentState>;

/** initial practitioners-state state */
export const initialState: ImmutableStudentState = SeamlessImmutable({
  studentsById: {},
});

/** the students reducer function */
export default function reducer(
  state: ImmutableStudentState = initialState,
  action: StudentActionTypes
): ImmutableStudentState {
  switch (action.type) {
    case STUDENTS_FETCHED:
      const studentsToPut = action.overwrite
        ? { ...action.studentsById }
        : { ...state.studentsById, ...action.studentsById };
      return SeamlessImmutable({
        ...state,
        studentsById: studentsToPut,
      });
    case REMOVE_STUDENTS: {
      return SeamlessImmutable({
        ...state,
        studentsById: action.studentsById,
      });
    }
    default:
      return state;
  }
}

// Selectors

/** Get all Students keyed by Student.identifier
 * @param {Partial<Store>} state - Portion of the store
 * @returns {[key: string]: Student} studentsById
 */
export const getStudentsById = (state: Partial<Store>): { [key: string]: Student } => {
  return (state as any)[reducerName].studentsById;
};

/** Get all students as an array of Student objects
 * @param {Partial<Store>} state - the redux store
 * @returns {Student[]} - an array of Student objects
 */
export const getStudentsArray = (state: Partial<Store>): Student[] => {
  return values(getStudentsById(state));
};

/** Get students per site as an array of Student objects
 * @param {Partial<Store>} state - the redux store
 * @param {string} groupId - the site ID of the filter by
 * @returns {Student[]} - an array of Student objects
 */
export const getStudentsArrayByGroupId = (state: Partial<Store>, groupId: string): Student[] => {
  return getStudentsArray(state).filter((student: Student) => student.groupIdentifier === groupId);
};

/** Get students per site as a an object: studentsByGroupId
 * @param {Partial<Store>} state - the redux store
 * @param {string} groupId - the site ID of the filter by
 * @returns {{[key: string]: Student[]}} studentsByGroupId
 */
export const getStudentsByGroupId = (
  state: Partial<Store>,
  groupId: string[]
): { [key: string]: Student[] } => {
  const studentsByGroupId: { [key: string]: Student[] } = {};

  for (let i = 0; i < getStudentsArray(state).length; i += 1) {
    studentsByGroupId[groupId[i]] = getStudentsArrayByGroupId(state, groupId[i]);
  }

  return studentsByGroupId;
};
