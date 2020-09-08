import { Resolver, Field, InputType, Arg, Mutation, Ctx, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from 'argon2';

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

    @Mutation(() => UserResponse)
    async register(
        @Arg("input") input: UsernamePasswordInput,
        @Ctx() {em}: MyContext
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
        const user = em.create(User, {username: input.username, password: hashedPassword});
        try{
            await em.persistAndFlush(user);
        }catch(err){
            if(err.code === '23505' || err.detail.includes('already exists')){
                return {
                    errors:[{
                        field: 'Username',
                        message: "username already exists"
                    }]
                }
            }
        }
        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("input") input: UsernamePasswordInput,
        @Ctx() {em}: MyContext
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

        
        return {
            user
        };
    }
}