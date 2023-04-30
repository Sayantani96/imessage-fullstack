import { Box,Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import Modal from "./Modal/Modal";
import { useState } from "react";
import {ConversationPopulated} from '../../../../../backend/src/util/types';
import ConversationItem from "./ConversationItem";
import { useRouter } from "next/router";


interface ConversationLists{
    session:Session;
    conversations:Array<ConversationPopulated>
    viewConversation: (
        conversationId: string,
      ) => void;
}

const ConversationList : React.FC<ConversationLists>=({session,conversations,viewConversation}) => {
    const [isOpen,setIsOpen]=useState(false);
    const openModal=()=>setIsOpen(true)
    const closeModal=()=>setIsOpen(false)
    const router=useRouter();
    const {
        user:{id:userId}
    }=session
    
  return (
    <Box width="100%">
        <Box
            py={2}
            px={4}
            mb={4}
            bg="blackAlpha.300"
            borderRadius={4}
            cursor="pointer"
            onClick={openModal}
        >
            <Text 
            textAlign="center"
            color="whiteAlpha.800"
            fontWeight={500}
            >
                Start a Conversation Now!!
            </Text>
        </Box>
        <Modal isOpen={isOpen} onClose={closeModal} session={session}/>
        {
            conversations.map(
                conversation=>
                <ConversationItem 
                conversation={conversation} 
                key={conversation.id}
                onClick={() =>
                    viewConversation(conversation.id)
                  }
                isSelected={conversation.id===router.query.conversationId}
                userId={userId as string}
                />
                )
        }
    </Box>
  )
}

export default ConversationList;