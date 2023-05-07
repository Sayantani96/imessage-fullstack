import { useQuery } from '@apollo/client'
import { Flex, Stack } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { MessageData, MessageDataSubscription, MessagesVariables } from '../../../../util/type'
import MessagesOperations from '../../../../graphql/operations/messages'
import { toast } from 'react-hot-toast'
import SkeletonLoader from '../../../Common/SkeletonLoader'
import MessageItem from './MessageItem'


interface MessagesProps {
    userId:string;
    conversationId:string;
}

const Messages:React.FC<MessagesProps> = ({userId,conversationId}) => {

    const {data,error,loading,subscribeToMore}=useQuery<
    MessageData,MessagesVariables
    >(MessagesOperations.Query.messages,{
        variables:{
            conversationId
        },
        onError:({message})=>{
            toast.error(message);
        },
    });


    const subscribeToMoreMessages=(conversationId:string)=>{
        subscribeToMore({
            document:MessagesOperations.Subscriptions.messageSent,
            variables:{
                conversationId
            },
            updateQuery:(
                prev,
                {
                    subscriptionData
                }:  MessageDataSubscription
            )=>{
                    if(!subscriptionData) return prev;
                    const newMessage=subscriptionData.data.messageSent

                    return Object.assign({},prev,{
                        messages:newMessage.sender.id===userId?prev.messages:[newMessage,...prev.messages]
                    })
            }
        })
    }

    useEffect(()=>{
        subscribeToMoreMessages(conversationId)
    },[conversationId])

    console.log("Here is our subscription data:",data);
  return (
    <Flex
    direction="column"
    justify="flex-end"
    overflow="hidden"
    >
       {
        loading && (
            <Stack>
                <SkeletonLoader count={4} height="60px" width="100%"/>
            </Stack>
        )
       } 
       {
        data?.messages && (
            <Flex direction="column-reverse" overflowY="scroll" height="100%">
             {
                    data.messages.map(message=><MessageItem
                        key={message.id} 
                        message={message} 
                        sentByMe={message.sender.id===userId}
                        />)
                }
            </Flex>
        )
       }
    </Flex>
  )
}

export default Messages