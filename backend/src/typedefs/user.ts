import { gql } from "graphql-tag";

const userTypeDefs=gql `
    type User{
        id:String
        name:String
        username:String
        email:String
        emailVerified:Boolean
        image:String
    }
    type Query{
        searchUsers(username: String!): [SearchedUsers]
    }
    type Mutation{
        createUsername(username: String!): CreateUsernameResponse
    }

    type CreateUsernameResponse{
        success: Boolean
        error: String
    }
    type SearchedUsers{
        id:String
        username:String
    }
`;
export default userTypeDefs