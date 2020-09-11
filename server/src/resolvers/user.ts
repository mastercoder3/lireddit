import { Resolver, Field, InputType, Arg, Mutation, Ctx, ObjectType, Query } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';

@InputType()
class UsernamePasswordInput{

    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse{
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver{

    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {req, em}: MyContext
    ){
        if(!req.session!.userId){
            return null;
        }

        const user = await em.findOne(User, {id: req.session!.userId});
        return user;

    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("input") input: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        if(input.username.length <= 2){
            return {
                errors:[{
                    field: 'username',
                    message: "username too short"
                }]
            }
        }
        if(input.password.length < 6){
            return {
                errors:[{
                    field: 'password',
                    message: "password too short. min of 6"
                }]
            }
        }
        const hashedPassword = await argon2.hash(input.password);
        // const user = em.create(User, {username: input.username, password: hashedPassword});
        let user;
        try{
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username: input.username,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning("*");
            user = result[0];
            // await em.persistAndFlush(user);
        }catch(err){
            if(err.code === '23505' || err.detail.includes('already exists')){
                return {
                    errors:[{
                        field: 'username',
                        message: "username already exists"
                    }]
                }
            }
        }
        req.session!.userId = user.id;

        return {user};
    }
    

    @Mutation(() => UserResponse)
    async login(
        @Arg("input") input: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        const user = await em.findOne(User, {username: input.username});
        if(!user){
            return {
                errors:[{
                    field: 'username',
                    message: "Username Doesn't exists"
                }]
            }
        }
        const valid = await argon2.verify(user.password, input.password);
        if(!valid){
            return {
                errors:[{
                    field: 'password',
                    message: "incorrect password"
                }]
            }
        }

        req.session!.userId = user.id;
        
        return {
            user
        };
    }
}