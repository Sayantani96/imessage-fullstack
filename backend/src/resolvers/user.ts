import { User } from "next-auth";
import { CreateUsernameResponse, GraphQLContext } from "../util/types";
import {ApolloError} from "apollo-server-core"
const userResolvers={
    Query:{
        searchUsers:async(
            _:any,
            args:{username:string},
            context:GraphQLContext  
        ):Promise<Array<User>>=>{
           const {username:searchedUsername} =args;
           const {session,prisma}=context;
           console.log("Entered Here in User",session);
           if(!session?.user){
            throw new ApolloError("Can't find user");
           }
           const {
            user:{username}
           }=session;
           try{
            const users=await prisma.user.findMany({
                where:{
                    username:{
                        contains:searchedUsername,
                        not:username,
                        mode:"insensitive",
                    }
                }
            })
            return users;
           }catch(error:any){
            throw new ApolloError(error?.message);
           }
        }
    },
    Mutation:{
        createUsername:async (
            _:any,
            args:{username:string},
            context:GraphQLContext
            ):Promise<CreateUsernameResponse>=>
        {
            const {username}=args;
            const {session,prisma}=context;
            if(!session?.user){
                return{
                    success:false,
                    error:"Not Authorised",
                }
            }
            const {id:userId}=session.user;

            try{
              //check if the username exists
              const existingUser=await prisma.user.findUnique({
                where:{
                         username,
                }
              });
              if(existingUser) return {
                success:false,
                error: "Username already exists!!"
              };
              //update the username in user
              await prisma.user.update({
                where:{
                   id:userId 
                },
                data:{
                    username,
                }
              });
              return {success:true, error:""}
            }catch(error){
                console.log("CreateUsername error",error);
                return {
                    success:false,
                    error:JSON.stringify(error),
                }
            }
    },
    
    },
    // Subscription:{}
}

export default userResolvers;