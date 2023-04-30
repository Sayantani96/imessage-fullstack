
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import {ChakraProvider, theme} from '@chakra-ui/react'
import { ApolloProvider } from '@apollo/client'
import { client } from '../graphql/apollo-client'
import { Toaster } from 'react-hot-toast'


export default function App({ Component, pageProps: {session,...pageProps} }: AppProps) {
  return (
<ApolloProvider client={client}>
<SessionProvider session={session}>
  <ChakraProvider theme={theme}>
    <Component {...pageProps} />
    <Toaster/>
    </ChakraProvider>
  </SessionProvider>
  </ApolloProvider>
  )
  
  
}
