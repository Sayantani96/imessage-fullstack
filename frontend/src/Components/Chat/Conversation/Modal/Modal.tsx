import { useLazyQuery, useMutation} from "@apollo/client";
import {
     Button, 
     Input, 
     Modal,
      ModalBody, 
      ModalCloseButton, 
      ModalContent, 
      ModalHeader, 
      ModalOverlay, 
      Stack} from "@chakra-ui/react"
import { useState } from "react";
import UserOperations from '../../../../graphql/operations/user'
import { CreateConversationData, CreateConversationInput, SearchUsersData, SearchUsersInput, SearchedUsers } from "../../../../util/type";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import toast from "react-hot-toast";
import conversation from "../../../../graphql/operations/conversation";
import { Session } from "next-auth";
import { useRouter } from "next/router";


//prop types for modal
interface ModalProps{
    isOpen:boolean;
    onClose:()=>void;
    session:Session;
}


const ConversationModal:React.FC<ModalProps>=({session,isOpen,onClose})=> {

    //intialising the required variables
    const [username,setUsername]=useState("");
    const {user:{id:userId}}=session;
    const router=useRouter();

  //partcipants lists in a conversation
   const [participants,setParticipants]=useState<
   Array<
   SearchedUsers
   >>([]);
   const addParticipants=(user:SearchedUsers)=>{
        setParticipants(prev=>[...prev,user]);
        setUsername("");
        console.log(participants);
   }


   const removeParticipant=(userId:string)=>{
    setParticipants(prev=>prev.filter(user=>user.id!==userId));
   }


    const [
        searchUsers,
        {
          data,
          loading,
          error,
        },
      ] = useLazyQuery<SearchUsersData, SearchUsersInput>(
        UserOperations.Queries.searchUsers
      );


    const [
      addConversation,
      {
        data:conversationData,
        loading:conversationLoading,
        error:conversationError
      }
    ]=useMutation<CreateConversationData,CreateConversationInput>(conversation.Mutation.createConversation)



    const handleSubmit=(event:React.FormEvent)=>{
        event.preventDefault();
        // Query the usernames
        searchUsers({variables:{username}});
    }



    const createConversation=async()=>{
      const participantIds=[userId,...participants.map(member=>member.id)];
        try{
            //call createConversation mutation
            const {data}=await addConversation({
              variables:{
                participantIds:participantIds,
              }
            });
            if(!data?.createConversation){
              throw new Error("Failed to create conversation");
            }
            const {
              createConversation:{conversationId}
            }=data;
            router.push({query:{conversationId}})
            setParticipants([]);
            onClose();
            console.log("conversation data",data);
        }catch(error:any){
            toast.error(error?.message);
        }
    }
    

    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg="#2d2d2d" pb={4}>
            <ModalHeader>Find your Friend!!</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit}>
                <Stack>
                    <Input 
                    placeholder="Search a username" 
                    value={username}
                    onChange={(event)=>setUsername(event.target.value)}
                    />
                    <Button 
                    type="submit" 
                    isDisabled={!username} 
                    isLoading={loading}>
                        Search
                    </Button>
                </Stack>
              </form>
              {
                username.length!==0&&data?.searchUsers &&  <UserSearchList 
                users={data.searchUsers} 
                addParticipant={addParticipants}/>
              }
              {
                participants.length!==0 && 
                <>
                <Participants participants={participants} removeParticipants={removeParticipant}/>
                <Button 
                bg="#3182CE"
                width="100%"
                mt={3}
                onClick={createConversation}
                >
                    Start Conversation
                </Button>
                </>
              }
             
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
}
  export default ConversationModal;