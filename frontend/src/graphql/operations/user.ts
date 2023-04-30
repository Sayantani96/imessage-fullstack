import { gql} from "@apollo/client";

export default {
    Queries: {
        searchUsers: gql`
        query SearchUsers($username:String!){
            searchUsers(username:$username){
                id
                username
            }
        }
        `
    },
    Mutations:{
        createUserName:gql`
            mutation createUsername($username: String!) {
                createUsername(username:$username){
                    success
                    error
                }
            }
        `,
    },
    Subscriptions:{
        
    }
}