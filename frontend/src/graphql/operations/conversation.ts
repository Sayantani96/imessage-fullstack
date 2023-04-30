import { gql } from "@apollo/client";

export default{
    Queries:{
        conversations:gql`
            query Conversations{
                conversations{
                    id
                    participants{
                        user{
                            id
                            username
                        }
                        hasSeenLatestMessage
                    }
                    latestMessage{
                        id
                        sender{
                            id
                            username
                        }
                        body
                        createdAt
                    }
                    updatedAt
                }
            }
        `
    },
    Mutation:{
        createConversation:gql`
        mutation CreateConversation($participantIds:[String]!){
            createConversation(participantIds:$participantIds){
                conversationId
            }
        }
        `
    },
    Subscription:{
        conversationCreated:gql`
            subscription ConversationCreated{
                conversationCreated{
                        id
                        participants{
                            user{
                                id
                                username
                            }
                            hasSeenLatestMessage
                        }
                        latestMessage{
                            id
                            sender{
                                id
                                username
                            }
                            body
                            createdAt
                        }
                        updatedAt
                    }
                }
        `
    }
}