import { ConversationPopulated, MessagePopulated } from "../../../backend/src/util/types";

//Users
export interface CreateUsernameVariables{
    username:string
}
export interface CreateUsernameData{
    createUsername:{
        success:boolean;
        error:string
    }    
}

export interface SearchUsersInput{
    username:string;
}

export interface SearchUsersData{
    searchUsers:Array<SearchedUsers>
}

export interface SearchedUsers{
    id:string;
    username:string;
}

//conversations

export interface CreateConversationData{
    createConversation:{
        conversationId:string;
    }
}

export interface ConversationsData {
    conversations: Array<ConversationPopulated>;
  }
  
export interface CreateConversationInput{
    participantIds:Array<string>;
}

export interface ConversationUpdateData{
    conversationUpdated:{
        conversation:Omit<ConversationPopulated, 'latestMessage'> & {
            latestMessage: MessagePopulated
        }
    }
}


export interface MessageData{
    messages:Array<MessagePopulated>
}

export interface MessagesVariables{
    conversationId:string;
}

export interface MessageDataSubscription{
    subscriptionData:{
        data:{
            messageSent:MessagePopulated
        }
    }
}