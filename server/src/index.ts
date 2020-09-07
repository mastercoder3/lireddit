import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import microConfig from './mikro-orm.config';
import { ApolloServer } from 'apollo-server-express';
// import { Post } from './entities/Post';
import expres from 'express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

const main = async () =>{
    const orm = await MikroORM.init(microConfig);

    await orm.getMigrator().up();
    // const post = orm.em.create(Post, {title: 'my first post'});
    // await orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {});
    // console.log(posts);

    const app = expres();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        context:  () => ({em: orm.em})
    });

    apolloServer.applyMiddleware({app});


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