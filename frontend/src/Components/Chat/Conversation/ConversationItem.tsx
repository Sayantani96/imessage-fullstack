import { Avatar, Box, Flex, Stack,Text, flexbox } from "@chakra-ui/react"
import { ConversationPopulated } from "../../../../../backend/src/util/types"
import { formatUsernames } from "../../../util/functions";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale";
import { GoPrimitiveDot } from "react-icons/go";

interface ConversationItemProps{
    conversation:ConversationPopulated;
    onClick: () => void;
    isSelected:boolean;
    userId?:string;
    userImage?:any;
    hasSeenLatestMessage: boolean|undefined;
}

const ConversationItem:React.FC<ConversationItemProps> = ({
   conversation,
  onClick,
  isSelected,
  userId,
  userImage,
  hasSeenLatestMessage
}) => {
  console.log("Latest Message",conversation.latestMessage);

  const formatRelativeLocale = {
    lastWeek: "eeee",
    yesterday: "'Yesterday",
    today: "p",
    other: "MM/dd/yy",
  };
  return (
    <Stack
    direction="row"
    align="center"
    justify="space-between"
    p={4}
    cursor="pointer"
    borderRadius={4}
    bg={
      isSelected ? "whiteAlpha.200" : "none"
    }
    _hover={{ bg: "whiteAlpha.200" }}
    onClick={onClick}
    // onContextMenu={handleClick}
    position="relative"
  >
    {/* {showMenu && (
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuList bg="#2d2d2d">
          <MenuItem
            icon={<AiOutlineEdit fontSize={20} />}
            onClick={(event) => {
              event.stopPropagation();
              onEditConversation();
            }}
          >
            Edit
          </MenuItem>
          {conversation.participants.length > 2 ? (
            <MenuItem
              icon={<BiLogOut fontSize={20} />}
              onClick={(event) => {
                event.stopPropagation();
                onLeaveConversation(conversation);
              }}
            >
              Leave
            </MenuItem>
          ) : (
            <MenuItem
              icon={<MdDeleteOutline fontSize={20} />}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteConversation(conversation.id);
              }}
            >
              Delete
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    )} */}
    
    <Avatar src={userImage}/>
    <Flex justify="space-between" width="80%" height="100%">
      <Flex direction="column" width="70%" height="100%">
        <Text
          fontWeight={600}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {formatUsernames(conversation.participants, userId)}
        </Text>
        {conversation.latestMessage && (
          <Box width="140%">
            <Text
              color="whiteAlpha.700"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {conversation.latestMessage.body}
            </Text>
          </Box>
        )}
      </Flex>
      <Text color="whiteAlpha.700" textAlign="right">
        {formatRelative(new Date(conversation.updatedAt), new Date(), {
          locale: {
            ...enUS,
            formatRelative: (token) =>
              formatRelativeLocale[
                token as keyof typeof formatRelativeLocale
              ],
          },
        })}
        <Flex position="absolute" right="40px" ml={4}>
      {hasSeenLatestMessage === false && (
        <GoPrimitiveDot fontSize={18} color="#6B46C1" />
        )} 
    </Flex>
      </Text>
    </Flex>
  </Stack>
  )
}

export default ConversationItem