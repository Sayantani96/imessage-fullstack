import userResolvers from "./user";
import merge from 'lodash.merge';
import conversationResolvers from './conversation'
import messageResolvers from './messages'
import scalarsResolvers from './scalars'

const resolvers=merge({},userResolvers,conversationResolvers,messageResolvers,scalarsResolvers);

export default resolvers;