
import Auth from "../Components/Auth/Auth";
import Chat from "../Components/Chat/Chat";
import { Box } from "@chakra-ui/react";
import { NextPage, NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";

 const Home: NextPage=()=> {
  const {data:session}=useSession();
  const reloadSession=()=>{
    const event=new Event("visibilitychange");
    document.dispatchEvent(event);
  }
  console.log("Data:",session);
  return (
    <Box>
    {
      session?.user?.username ? <Chat session={session}/>:
      <Auth 
      session={session} 
      reloadSession={reloadSession}
      />
    }
     
    </Box>
  )
}

export async function getServerSideProps(context: NextPageContext){
      const session=await getSession(context);

      return {
        props:{
          session,
        }
      }
}

export default Home;
