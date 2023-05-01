// import { ApolloError } from "apollo-server-core";
import { ConversationPopulated, GraphQLContext } from "../util/types";
import { Prisma } from "@prisma/client";
import { withFilter } from "graphql-subscriptions";
import {GraphQLError} from 'graphql';

const resolvers={
    Query:{
        conversations:async(
            _:any,
            __:any,
            context:GraphQLContext
        ):Promise<Array<ConversationPopulated>>=>{
            console.log("Hello from Conversation");
            const {prisma,session}=context;
            console.log("Entered Here",session);
            if(!session?.user){
                throw new GraphQLError("Not Authorised");
            }
            const {
                user:{
                    id:userId
                }
            }=session;
            try{
                
                //Find all conversations the user is a part of
                const conversations=await prisma.conversation.findMany({
                    include: conversationPopulated,
                })
                
                return conversations.filter(conversation=>
                    !!conversation.participants.find(participant=>participant.userId===session?.user.id)
                    )
                
            }catch(error:any){
                throw new GraphQLError(error?.message);
            }
        }
    },
    Mutation:{
        createConversation:async(
            _:any,
            args:{
                participantIds:Array<string>,
                
            },
            context:GraphQLContext
        ):Promise<{conversationId:string}>=>{
           const {session,prisma,pubsub}=context;
           const {participantIds}=args;
           if(!session?.user){
                throw new GraphQLError("Not Authorised");
           }
           const {
            user:{id:userId}
           }=session;
           try{
                const conversation=await prisma.conversation.create({
                    data:{
                        participants:{
                            createMany:{
                                data:participantIds.map(id=>({
                                    userId:id,
                                    hasSeenLatestMessage:id===userId
                                }))
                            }
                        }
                    },
                    include:conversationPopulated,
                   
                });
                pubsub.publish('CONVERSATION_CREATED',{
                    conversationCreated:conversation
                })
                return{
                    conversationId:conversation.id
                }
           }catch(error:any){
                throw new GraphQLError(error?.message);
           }
        }
    },
    Subscription:{
        conversationCreated:{
            // subscribe:(_:any,__:any,context:GraphQLContext)=>{
            //     const {pubsub}=context;
            //     return pubsub.asyncIterator(['CONVERSATION_CREATED'])
            // }

            subscribe: withFilter((_:any,__:any,context:GraphQLContext)=>{
                    const {pubsub}=context;
                    return pubsub.asyncIterator(['CONVERSATION_CREATED'])
                },(payload:ConversationCreatedSubscriptionPayload,_:any,context:GraphQLContext)=>{
                        const {session}=context;
                        const {
                            conversationCreated: {participants}, 
                        }=payload

                        const userParticipant:boolean= !!participants.find(p=>p.userId===session?.user.id)
                        return userParticipant;
                })
        }

    }
};
export interface ConversationCreatedSubscriptionPayload{
    conversationCreated:ConversationPopulated;
}

export const participantPopulated=Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user:{
        select:{
            id:true,
            username:true
        }
    }
})

export const conversationPopulated=Prisma.validator<
Prisma.ConversationInclude
>()({
    participants:{
        include:participantPopulated
    },
    latestMessage:{
        include:{
            sender:{
                select:{
                    id:true,
                    username:true
                }
            }
        }
    }
})


export default resolvers;