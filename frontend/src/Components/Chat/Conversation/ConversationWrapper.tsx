import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import conversation from "../../../graphql/operations/conversation";
import { ConversationPopulated, ParticipantPopulated } from "../../../../../backend/src/util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "../../Common/SkeletonLoader";
import { ConversationUpdateData } from "../../../util/type";


interface ConversationWrapper{
    session:Session;
}

const ConversationWrapper : React.FC<ConversationWrapper>=({session}) => {

  const router=useRouter();
  const { conversationId } = router.query;
  const {user:{id:userId}}=session;

  const {
    data:conversationsData,
    error:conversationsError,
    loading:conversationsLoading,
    subscribeToMore
  }=useQuery(conversation.Queries.conversations)

  const [markConversationAsRead]=useMutation<
  {
    markConversationAsRead:boolean
  },
  {
    userId:string,
    conversationId:string
  }
  >(conversation.Mutation.markConversationAsRead)

  useSubscription<ConversationUpdateData,null>(
    conversation.Subscription.conversationUpdated,
    {
      onData:({client,data})=>{
        const {data:subscriptionData}=data

        if(!subscriptionData) return;

        const {conversationUpdated:{conversation}}=subscriptionData

        const currentViewinConversation=conversation.id===conversationId

        if(currentViewinConversation){
          viewConversation(conversationId,false);
        }
      }
    }
  )


  const viewConversation=async(
    conversationId:string,
    hasSeenLatestMessage:boolean|undefined
    )=>{
    router.push({query:{conversationId}})

    if(hasSeenLatestMessage) return;

    try{
          await markConversationAsRead({
            variables:{
              userId,
              conversationId
            },
            optimisticResponse:{
              markConversationAsRead:true
            },
            update:(cache)=>{
              const participantsFragment = cache.readFragment<{
                participants: Array<ParticipantPopulated>;
              }>({
                id: `Conversation:${conversationId}`,
                fragment: gql`
                  fragment Participants on Conversation {
                    participants {
                      user {
                        id
                        username
                      }
                      hasSeenLatestMessage
                    }
                  }
                `,
              });
              if (!participantsFragment) return;

          /**
           * Create copy to
           * allow mutation
           */
          const participants = [...participantsFragment.participants];
          const userParticipantIdx = participants.findIndex(
            (p) => p.user.id === userId
          );

          /**
           * Should always be found
           * but just in case
           */
          if (userParticipantIdx === -1) return;

          const userParticipant = participants[userParticipantIdx];
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };

          /**
           * Update cache
           */
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipants on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          });
            }
          })    
    }catch(error:any){
      console.log("viewConversation error",error?.message)
    }

  }

  

  const subscribeToNewConversations=()=>{
    subscribeToMore({
      document: conversation.Subscription.conversationCreated,
      updateQuery: (prev, { subscriptionData }:{subscriptionData:{data:{conversationCreated:ConversationPopulated}}}) => {

        if(!subscriptionData) return prev;
        const newConversation=subscriptionData.data.conversationCreated;
        return Object.assign({}, prev, {
            conversations: [newConversation,...prev.conversations]
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
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      width={{ base: "100%", md: "400px" }}
      bg="whiteAlpha.50"
      py={6}
      px={3}
      position="relative"
    >
      {conversationsLoading ? (
        <SkeletonLoader count={7} height="80px" width="360px" />
      ) : (
        <ConversationList
          session={session}
          conversations={conversationsData?.conversations || []}
          viewConversation={viewConversation}
        />
      )}
    </Box>
    )
  }

  export default ConversationWrapper;