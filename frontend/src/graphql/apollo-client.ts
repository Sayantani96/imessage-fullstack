import { ApolloClient, InMemoryCache, ApolloProvider, gql, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getSession } from 'next-auth/react';

const httpLink= new HttpLink({
    uri: 'http://localhost:4000/graphql',
    credentials:'include',

});

const wslink=typeof window!=="undefined"? new GraphQLWsLink(createClient({
    url: 'ws://localhost:4000/subscriptions',
    connectionParams:async()=>({
      session: await getSession()
    })
  })):null;

  const link=typeof window!=="undefined" && wslink!=null?
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wslink,
    httpLink,
  ): httpLink

export const client= new ApolloClient({
    link,
    cache: new InMemoryCache()
});