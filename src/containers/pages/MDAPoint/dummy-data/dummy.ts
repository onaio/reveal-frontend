export interface FileFields {
  identifier: string; // the unique identifier of the file
  fileLength: number; // the length of the file (lines / rows)
  fileName: string; // the name of the file
  fileSize: string; // the of the file
  lastUpdated: string; // the date of the latest file update
  owner: string; // the username of the file creator
  url: string; // download location of the file
}

export const uploadedStudentsLists = [
  {
    fileName: 'Barush_school.csv',
    owner: 'Mowshaqs',
    fileSize: '234KB',
    fileLength: 45,
    lastUpdated: '4/05/2020',
    identifier: '123',
    url:
      'https://user-images.githubusercontent.com/12836913/81139056-3be46680-8f19-11ea-92f8-fb1ab7877626.png',
  },
  {
    fileName: 'Gicandi_school.csv',
    owner: 'Mowshaqs',
    fileSize: '234KB',
    fileLength: 45,
    identifier: '1234',
    lastUpdated: '4/05/2020',
    url:
      'https://user-images.githubusercontent.com/12836913/81139056-3be46680-8f19-11ea-92f8-fb1ab7877626.png',
  },
  {
    fileName: 'Junior_school.csv',
    owner: 'Mowshaqs',
    fileSize: '234KB',
    fileLength: 45,
    identifier: '12345',
    lastUpdated: '4/05/2020',
    url:
      'https://user-images.githubusercontent.com/12836913/81139056-3be46680-8f19-11ea-92f8-fb1ab7877626.png',
  },
];
