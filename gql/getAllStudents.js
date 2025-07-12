const studentId = "122038960";

export const GET_ALL_STUDENTS = `
    allUsers(filter: {role: {eq: ${studentId}}}) {
        fullname
        id
    }
`;

export const GET_ALL_STUDENTS_FIELDS = `
    allUsers(filter: {role: {eq: ${studentId}}}) {
      id
      email
      fullname
      birthdate
      gender
      phone
      residence
      experience
      level
      avatar {
        url
        title
        filename
      }
      role {
        id
        name
      }
      createdAt
      updatedAt
    }
`;
