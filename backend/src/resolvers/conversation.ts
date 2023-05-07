// import { ApolloError } from "apollo-server-core";
import { ConversationPopulated, ConversationUpdatedSubscriptionData, GraphQLContext } from "../util/types";
import { Prisma } from "@prisma/client";
import { withFilter } from "graphql-subscriptions";
import {GraphQLError} from 'graphql';
import { userIsConversationParticipant } from "../util/functions";

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
        },
        markConversationAsRead:async function(
            _:any,
            args:{
                userId:string,
                conversationId:string
            },
            context:GraphQLContext
        ):Promise<boolean>{
            const {session,prisma}=context;
            const {userId,conversationId}=args;

            if(!session?.user){
                throw new GraphQLError("Not Authorised");
           }
          try{
            const participant=await prisma.conversationParticipant.findFirst({
                where:{
                    userId,
                    conversationId
                }
            })

            if(!participant){
                throw new GraphQLError("participant entity not found");
            }
            await prisma.conversationParticipant.update({
                where:{
                    id:participant.id,
                },
                data:{
                    hasSeenLatestMessage:true
                }
            })
            return true;
          }catch(error:any){
            throw new GraphQLError("Mark Conversation error",error?.message)
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
        },
        conversationUpdated:{
            subscribe: withFilter(
                (_: any, __: any, context: GraphQLContext) => {
                  const { pubsub } = context;
        
                  return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
                },
                (
                  payload: ConversationUpdatedSubscriptionData,
                  _,
                  context: GraphQLContext
                ) => {
                  const { session } = context;
        
                  if (!session?.user) {
                    throw new GraphQLError("Not authorized");
                  }
        
                  const { id: userId } = session.user;
                  const {
                    conversationUpdated: {
                      conversation: { participants },
                    //   addedUserIds,
                    //   removedUserIds,
                    },
                  } = payload;
        
                  const userIsParticipant = userIsConversationParticipant(
                    participants,
                    userId as string
                  );
        
                //   const userSentLatestMessage =
                //     payload.conversationUpdated.conversation.latestMessage?.senderId ===
                //     userId;
        
                //   const userIsBeingRemoved =
                //     removedUserIds &&
                //     Boolean(removedUserIds.find((id) => id === userId));
        
                //   return (
                //     (userIsParticipant && !userSentLatestMessage) ||
                //     userSentLatestMessage ||
                //     userIsBeingRemoved
                //   );

                return userIsParticipant;
                }
              ),
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