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

export const GET_ALL_COMPANIES = `
  allCompanies(first: 100, skip: 0) {
      id
      name
      companyType
      description
      logo {
        url
        title
        filename
      }
      adsImages {
        url
        title
        filename
      }
      createdAt
      updatedAt
  }
`;

export const CREATE_COMPANY = `
  mutation CreateCompany(
    $name: String!,
    $companyType: String!,
    $description: String,
    $logoId: ID,
    $adsImageIds: [ID!]
  ) {
    createCompany(data: {
      name: $name,
      companyType: $companyType,
      description: $description,
      logo: { connect: { id: $logoId } },
      adsImages: { connect: $adsImageIds }
    }) {
      id
      name
      companyType
      description
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMPANY = `
  mutation UpdateCompany(
    $id: ID!,
    $name: String,
    $companyType: String,
    $description: String,
    $logoId: ID,
    $adsImageIds: [ID!]
  ) {
    updateCompany(
      id: $id,
      data: {
        name: $name,
        companyType: $companyType,
        description: $description,
        logo: { connect: { id: $logoId } },
        adsImages: { connect: $adsImageIds }
      }
    ) {
      id
      name
      companyType
      description
      createdAt
      updatedAt
    }
  }
`;
