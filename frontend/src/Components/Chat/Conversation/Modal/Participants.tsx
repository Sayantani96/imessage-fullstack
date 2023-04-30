import React from 'react'
import { SearchedUsers } from '../../../../util/type'
import { Button, Flex, Stack,Text } from '@chakra-ui/react'
import {CiCircleRemove} from 'react-icons/ci'
interface ParticipantsProps{
    participants:Array<SearchedUsers>,
    removeParticipants:(userid:string)=>void
}

const Participants:React.FC<ParticipantsProps> = ({participants,removeParticipants}) => {
  return (
    <Flex>
        {
            participants.map(
                member=>
                <Stack 
                direction="row" 
                key={member.id}
                mt={4}
                bg="whiteAlpha.50"
                padding={2}
                borderRadius={7}
                align="center"
                >
                   <Text>{member.username}</Text> 
                   <CiCircleRemove
                   size={20}
                   fontWeight={700}
                    onClick={()=>removeParticipants(member.id)}
                    />
                </Stack>
                )
        }       
    </Flex>
  )
}

export default Participants