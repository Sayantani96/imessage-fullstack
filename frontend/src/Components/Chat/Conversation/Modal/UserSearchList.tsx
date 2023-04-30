import React from 'react'
import { SearchedUsers } from '../../../../util/type'
import { Avatar, Box, Button, Flex,Stack,Text } from '@chakra-ui/react';

interface UserSearchListProps{
    users:Array<SearchedUsers>;
    addParticipant:(user:SearchedUsers)=>void;
}

const UserSearchList:React.FC<UserSearchListProps> = ({users,addParticipant}) => {
    return(
        <>
        {
            users.length===0?
            (<Flex justify="center" mt={4}>
               <Text>No Users Found</Text> 
            </Flex>):(
            <Stack mt={6}>
                {
                    users.map(user=>(
                        <Stack
                        key={user.id}
                        direction="row"
                        align="center"
                        justify="space-between"
                        spacing={3}
                        py={2}
                        px={4}
                        borderRadius={4}
                        bg="whiteAlpha.200"
                        >
                            <Flex>
                            <Avatar height="25px" width="25px" mr="6px"/>
                            <Text color="whiteAlpha.700"  textAlign="center">
                                {user.username}
                            </Text>
                            </Flex>
                            <Button 
                            bg="#3182CE"
                            onClick={()=>addParticipant(user)}
                            >
                               <Text mt="3px">
                               Add!!
                               </Text>
                            </Button>
                        </Stack>
                    ))
                }
            </Stack>)
        }
        </>
    )
}

export default UserSearchList