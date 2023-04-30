import { useMutation, useQuery } from '@apollo/client';
import { Button, Center, Image, Input, Stack,Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import * as React from 'react';
import UserOperations from '../../graphql/operations/user'
import {CreateUsernameData,CreateUsernameVariables} from '../../util/type'
import toast from 'react-hot-toast';
interface IAuthProps {
    session:Session | null;
    reloadSession: ()=> void;
}

const Auth: React.FunctionComponent<IAuthProps> = ({
    session,
    reloadSession
}) => {
    const [username,setUsername]=React.useState("");
    const [createUserName,{loading,error}]=useMutation<
    CreateUsernameData,
    CreateUsernameVariables
    >
    (UserOperations.Mutations.createUserName);
    const onSubmit=async ()=>{
        if(!username) return;
        try{
            //graphql mutation to send our data to backend.
           const {data}= await createUserName({variables:{username}}); 
            if(!data?.createUsername){
                throw new Error();
            } 
            if(data.createUsername.error){
                const {
                    createUsername: {error},
                }=data;
                throw new Error(error);
            }
            toast.success('Username created successfully:)');
            reloadSession();
        }catch(error){
            toast.error(error?.message);
            console.log("Onsubmit Error",error);
        }
    }

  return (
    <Center height="100vh" border="1px solid red">
        <Stack align='center' spacing={8}>
            {
                session?
                <>
                <Text>Create a Username</Text>
                <Input 
                placeholder="Enter your username" 
                value={username}
                onChange={event=>setUsername(event.target.value)}
                />
                <Button width="100%" onClick={onSubmit} isLoading={loading}>Save</Button>
                </>
                :
                <>
                <Text>Messenger</Text>
                <Button 
                    onClick={()=>signIn('google')}
                    leftIcon={<Image height='20px' src='/assets/google_logo.png'/>}
                >
                    Continue With Google</Button>
                </>
            }
        </Stack>
       
    </Center>
  );
};

export default Auth;
