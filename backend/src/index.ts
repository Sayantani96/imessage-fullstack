// npm install apollo-server-express apollo-server-core express graphql
// import { ApolloServer } from 'apollo-server-express';
// import { 
//     ApolloServerPluginDrainHttpServer,
//  } from 'apollo-server-core';
import {ApolloServer} from '@apollo/server'
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer'
import {expressMiddleware} from '@apollo/server/express4'
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
import { json } from 'body-parser';
import cors from "cors";


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
      // cache:"bounded",
      // context: async({req,res}):Promise<GraphQLContext>=>{
      //   const session=await getSession({req}) as Session;
      //   console.log ("Hi from API",session.user);
      //   return {session,prisma,pubsub};
      // },
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
    // server.applyMiddleware({ app,cors:corsOption });
    app.use(
      "/graphql",
      cors<cors.CorsRequest>(corsOption),
      json(),
      expressMiddleware(server, {
        context: async ({ req }): Promise<GraphQLContext> => {
          const session = await getSession({ req });
  
          return { session: session as Session, prisma, pubsub };
        },
      })
    );
  
    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

main(typeDefs,resolvers).catch(error=>console.log(error));
// function cors<T>(corsOption: { origin: string | undefined; credentials: boolean; }): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
//   throw new Error('Function not implemented.');
// }

