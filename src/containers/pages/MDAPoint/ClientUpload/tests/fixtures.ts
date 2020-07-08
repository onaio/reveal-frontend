// test csv files
export const testCsv = `opensrp_id,last_name,first_name,middle_name,gender,reveal_id,grade,grade_class,school_enrolled,school_name,birthdate,birthday_approximated,team_name,team_id
,Kito,Jacob,Tom,Male,6459069,Grade 1,,Yes,Test School,2020-02-05T03:00:00.000+03:00,false,testOrg,0f38856a-6e0f-5e31-bf3c-a2ad8a53210d`;

// creates a csv file from a string
export const csvCreate = () => {
  return new File([testCsv], 'test.csv', { type: 'tesxt/csv' });
};
