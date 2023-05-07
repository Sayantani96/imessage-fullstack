import { GraphQLError } from "graphql";
import { GraphQLContext, MessagePopulated, SendMessageArguments } from "../util/types";
import { Prisma } from "@prisma/client";
import { withFilter } from "graphql-subscriptions";
import {userIsConversationParticipant} from '../util/functions'
import { conversationPopulated } from "./conversation";
const resolvers={
    Query:{
        messages:async function(
        _:any,
        args:{conversationId:string},
        context:GraphQLContext):Promise<Array<MessagePopulated>>{
            const {session,prisma}=context;
            const {conversationId}=args;
            if(!session?.user){
                throw new GraphQLError("Not Authorised");
            }
            const{user:{id:userId}}=session

            //verify
            const conversation=await prisma.conversation.findUnique({
                where:{
                    id:conversationId
                },
                include:conversationPopulated
            })
            if(!conversation){
                throw new GraphQLError("Conversation Not Found");
            }

            const allowedToView=userIsConversationParticipant(conversation.participants,userId as string)
            if(!allowedToView){
                throw new GraphQLError("Access not allowed");
            }
            try{
                const messages=await prisma.message.findMany({
                    where:{
                        conversationId
                    },
                    include:messagePopulated,
                    orderBy:{
                        createdAt:'desc'
                    }
                   
                })
                return messages;
                // return [{body:"Hey this is a demo message"} as MessagePopulated]
            }catch(error:any){
                throw new GraphQLError(error?.message);
            }
            return [];
        }
    },
    Mutation:{
        sendMessage: async(
            _:any,
            args:SendMessageArguments,
            context:GraphQLContext
        ):Promise<Boolean>=>{
            const {session,prisma,pubsub}=context;
            if(!session?.user){
                throw new GraphQLError("Not Authorised")
            }
            const {user:{id:userId}}=session
            const {id,conversationId,senderId,body}=args;
            if(senderId!==userId){
                throw new GraphQLError("Not Authorised")
            }

            try{
                //new message

                const newMessageEntity=await prisma.message.create({
                    data:{
                        id,
                        senderId,
                        conversationId,
                        body
                    },
                    include: messagePopulated
                });
                //participant update
                const participant= await prisma.conversationParticipant.findFirst({
                    where:{
                        userId,
                        conversationId
                    }
                });

                if(!participant) throw new GraphQLError("Participant does not exist")

                const {id:participantId}=participant
                //update conversation

                const updateConversation=await prisma.conversation.update({
                    where:{
                        id:conversationId
                    },
                    data:{
                        latestMessageId:newMessageEntity.id,
                        participants:{
                            update:{
                                where:{
                                    id:participantId
                                },
                                data:{
                                    hasSeenLatestMessage:true
                                }
                            },
                            updateMany:{
                                where:{
                                    NOT:{
                                        userId
                                    }
                                },
                                data:{
                                    hasSeenLatestMessage:false
                                }
                                
                            }
                        }
                    },
                    include:conversationPopulated,
                })
                pubsub.publish("MESSAGE_SENT",{messageSent:newMessageEntity})
                pubsub.publish("CONVERSATION_UPDATED",{
                    conversationUpdated:{
                        updateConversation
                    }
                })
                

            }catch(error:any){
                console.log(error?.message);
                throw new GraphQLError(error?.message);
            }
            return true;
        }
    },
    Subscription:{
        messageSent:{
            subscribe:withFilter(
                (_:any,__:any,context:GraphQLContext)=>{
                    const {pubsub}=context
                    return pubsub.asyncIterator(["MESSAGE_SENT"])
                },
                (
                    payload:MessageSentSubscriptionPayload,
                    args:{conversationId:string},
                    context:GraphQLContext
                )=>{
                    console.log("Hello from message sent subscription");
                    return payload.messageSent.conversationId===args.conversationId
                }
            )
        }
    }
}



export const messagePopulated=Prisma.validator<Prisma.MessageInclude>()({
    sender:{
        select:{
            id:true,
            username:true,
        }
    }
});

export default resolvers;

export interface MessageSentSubscriptionPayload{
   messageSent: MessagePopulated
}