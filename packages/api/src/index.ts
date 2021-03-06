import mongoose from 'mongoose'
import express from 'express'
import connectRedis from 'connect-redis'
import session from 'express-session'
import Redis from 'ioredis'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import schemaDirectives from './directives'
import {
  DB_URI,
  DB_OPTIONS,
  REDIS_OPTIONS,
  SESS_OPTIONS,
  APOLLO_OPTIONS,
  HTTP_PORT
} from './config'
//
;(async () => {
  try {
    await mongoose.connect(DB_URI, DB_OPTIONS)

    const app = express()

    const RedisStore = connectRedis(session)

    const store = new RedisStore({
      // @ts-ignore
      client: new Redis(REDIS_OPTIONS)
    })

    app.use(
      session({
        store,
        ...SESS_OPTIONS
      })
    )

    const server = new ApolloServer({
      typeDefs,
      // @ts-ignore: See apollo-server#1775
      resolvers,
      schemaDirectives,
      ...APOLLO_OPTIONS
    })

    server.applyMiddleware({ app, cors: false })

    app.listen({ port: HTTP_PORT }, () =>
      console.log(`http://localhost:${HTTP_PORT}${server.graphqlPath}`)
    )
  } catch (e) {
    console.error(e)
  }
})()
