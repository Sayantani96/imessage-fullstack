// npm install apollo-server-express apollo-server-core express graphql
import { ApolloServer } from 'apollo-server-express';
import { 
    ApolloServerPluginDrainHttpServer,
 } from 'apollo-server-core';
import express from 'express';
import http from 'http'
import typeDefs from "./typedefs"
import resolvers from './resolvers';
import {makeExecutableSchema} from '@graphql-tools/schema'
import * as dotenv from 'dotenv'
import { DocumentNode } from 'graphql';
import {IResolvers} from "@graphql-tools/utils"
import {getSession} from 'next-auth/react'
import { GraphQLContext,Session, SubscriptionContext} from './util/types';
import {PrismaClient} from '@prisma/client'
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { PubSub } from 'graphql-subscriptions';


async function main (typeDefs:DocumentNode[],resolvers:IResolvers<any, any>){
  dotenv.config();
    const app = express();
    const httpServer = http.createServer(app);

    const schema= makeExecutableSchema({
      typeDefs,
      resolvers
    });

    const corsOption={
      origin:process.env.CLIENT_ORIGIN,
      credentials:true
    }
    //context parameters
    const prisma=new PrismaClient();
    //const pubsub
    const pubsub = new PubSub();
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/subscriptions',
    });
    const serverCleanup = useServer({ schema,context:async(ctx:SubscriptionContext):Promise<GraphQLContext>=>{
      if(ctx.connectionParams && ctx.connectionParams.session){
        const {session}=ctx.connectionParams;

        return {session,prisma,pubsub};
      }
      return {session:null,prisma,pubsub};
    }} , wsServer);
    const server = new ApolloServer({
     schema,
      csrfPrevention:true,
      cache:"bounded",
      context: async({req,res}):Promise<GraphQLContext>=>{
        const session=await getSession({req}) as Session;
        console.log ("Hi from API",session.user);
        return {session,prisma,pubsub};
      },
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
    
        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    });
    await server.start();
    server.applyMiddleware({ app,cors:corsOption });
    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

main(typeDefs,resolvers).catch(error=>console.log(error));
