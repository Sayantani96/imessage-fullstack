import { Box, Button, Flex } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import ConversationWrapper from './Conversation/ConversationWrapper';
import FeedWrapper from "./Feed/FeedWrapper";
import { wrap } from "module";
import { Session } from "next-auth";
interface IChatProps {
  session:Session;
}

const Chat: React.FC<IChatProps> = ({session}) => {
  return (
    <Flex height="100vh" border="1px solid red">
      <ConversationWrapper session={session}/>
      <FeedWrapper session={session}/>
      {/* <Button onClick={()=>signOut()}>Logout</Button> */}
    </Flex>
  );
};

export default Chat;
