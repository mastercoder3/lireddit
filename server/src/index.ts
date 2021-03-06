import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import microConfig from './mikro-orm.config';
import { ApolloServer } from 'apollo-server-express';
// import { Post } from './entities/Post';
import expres from 'express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { __prod__ } from './constants';
import { MyContext } from './types';
import cors from 'cors';

const main = async () =>{
    const orm = await MikroORM.init(microConfig);

    await orm.getMigrator().up();
    // const post = orm.em.create(Post, {title: 'my first post'});
    // await orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {});
    // console.log(posts);

    const app = expres();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(cors({
        origin: 'http://127.0.0.1:3000',
        credentials: true
    }))
    
    app.use(session({
        name: "qid",
        store: new RedisStore({client: redisClient, 
        disableTouch: true
        }),
        secret: "lireddit",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 7,
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__ //cookie only works in https
        }
    }));

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context:  ({req, res}): MyContext => ({em: orm.em, req, res})
    });

    apolloServer.applyMiddleware({app, cors: false});


    // app.get('/', (_, res) =>{
    //     res.send('hello');
    // });
    app.listen(4000, () =>{
        console.log('server started at http://localhost:4000')
    });
};

main().catch(err =>{
    console.error(err);
})