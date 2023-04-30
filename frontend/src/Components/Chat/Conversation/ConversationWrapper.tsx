import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { useQuery } from "@apollo/client";
import conversation from "../../../graphql/operations/conversation";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface ConversationWrapper{
    session:Session;
}

const ConversationWrapper : React.FC<ConversationWrapper>=({session}) => {
  const {
    data:conversationsData,
    error:conversationsError,
    loading:conversationsLoading,
    subscribeToMore
  }=useQuery(conversation.Queries.conversations)

  const router=useRouter();

  console.log("Here is data",conversationsData );
  const viewConversation=async(conversationId:string)=>{
    router.push({query:{conversationId}})
  }

  const subscribeToNewConversations=()=>{
    subscribeToMore({
      document: conversation.Subscription.conversationCreated,
      updateQuery: (prev, { subscriptionData }:{subscriptionData:{data:{conversationCreated:ConversationPopulated}}}) => {

        if(!subscriptionData) return prev;
        const newConversation=subscriptionData.data.conversationCreated;
        return Object.assign({}, prev, {
            conversations: [subscriptionData.data.conversationCreated,...prev.conversations]
        });
      }
    })
    
  }
  //Execute subscription on mount
  useEffect(()=>{
    subscribeToNewConversations();
  },[])

    return (
      <Box 
      width={{base:"100%",md:"650px"}} 
      border="1px solid red" 
      bg="whiteAlpha.50"
      py={6}
      px={3}
      >
        {/* Skeleton Loader */}
        <ConversationList 
        session={session} 
        conversations={conversationsData?.conversations||[]}
        viewConversation={viewConversation}
        />
      </Box>
    )
  }

  export default ConversationWrapper;