import { ConversationPopulated } from "../../../backend/src/util/types";

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