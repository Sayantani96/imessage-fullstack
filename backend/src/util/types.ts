import { Prisma, PrismaClient } from "@prisma/client";
import {ISODateString} from "next-auth";
import { conversationPopulated, participantPopulated } from "../resolvers/conversation";
import { Context } from "graphql-ws/lib/server";
import { PubSub } from 'graphql-subscriptions';
import {messagePopulated} from '../resolvers/messages'



export interface GraphQLContext {
    session: Session | null;
    prisma:PrismaClient;
    pubsub:PubSub;
}

// Users
export interface Session {
    user: User;
    expires:ISODateString;
}
interface User {
    id?: string;
    username?: string;
    email?:string;
    image?:string;
    name?:string;
}
export interface CreateUsernameResponse{
    success?:boolean;
    error?:string;
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{
    include: typeof conversationPopulated;
  }>;

  export type MessagePopulated = Prisma.MessageGetPayload<{
    include: typeof messagePopulated
  }>;

  export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
    include: typeof participantPopulated;
  }>;

export interface SubscriptionContext extends Context{
    connectionParams:{
        session?:Session;
    }
}

export interface SendMessageArguments{
            id:string;
            conversationId:string;
            senderId:string;
            body:string;
}

export interface ConversationUpdatedSubscriptionData{
    conversationUpdated:{
        conversation:ConversationPopulated
    }
}