import { useMutation } from "@apollo/client";
import { Box,Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import { toast } from "react-hot-toast";
import MessageOperations from '../../../../graphql/operations/messages'
import { SendMessageArguments } from "../../../../../../backend/src/util/types";
import { ObjectId } from "bson";
import { MessageData } from "../../../../util/type";

interface MessageInputProps{
    session:Session;
    conversationId:string;
}

const MessageInput:React.FC<MessageInputProps> = ({session,conversationId}) => {

   const [messageBody,setMessageBody]=useState(''); 
   const [sendMessage]=useMutation<
   {sendMessage:boolean},
   SendMessageArguments
   >(MessageOperations.Mutations.sendMessage);

   
   const onSendMessage=async(event:React.FormEvent)=>{
    event.preventDefault();
    try{
        console.log("on sent triggered");
        const { id: senderId } = session.user;
        const messageId=new ObjectId().toString();
        const newMessage:SendMessageArguments={
            id:messageId,
            senderId,
            conversationId,
            body:messageBody
        };
        const {data,errors}=await sendMessage({
            variables:{
                ...newMessage
            },
            optimisticResponse:{
                sendMessage:true
            },
            update:(cache)=>{
                const existingCache=cache.readQuery<MessageData>({
                    query:MessageOperations.Query.messages,
                    variables:{conversationId}
                }) as MessageData;

                cache.writeQuery<MessageData,{conversationId:string}>({
                    query:MessageOperations.Query.messages,
                    variables:{conversationId},
                    data:{
                        ...existingCache,
                        messages:[{
                            id:messageId,
                            body:messageBody,
                            senderId:session.user.id,
                            conversationId,
                            sender:{
                                id:session.user.id,
                                username:session.user.username,
                            },
                            createdAt:new Date(Date.now()),
                            updatedAt:new Date(Date.now())

                        },...existingCache.messages]
                    }
                })

            }
        });

        
        if(!data?.sendMessage || errors){
            throw new Error("Couldn't send message");
        }
        setMessageBody('');
    }catch(error:any){
        toast(error?.message);
    }
   }
  return (
   <Box px={4} py={6} width="100%">
    <form onSubmit={(event)=>{onSendMessage(event)}}>
        <Input
            value={messageBody}
            size="md"
            placeholder="Type a message..."
            _focus={{
                boxShadow:'none',
                border:"1px solid whiteAlpha.300"
            }}
            onChange={(event)=>setMessageBody(event.target.value)}
        />
    </form>
   </Box>
  )
}

export default MessageInput