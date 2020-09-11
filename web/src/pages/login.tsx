import React from 'react';
import { Formik, Form } from 'formik';
import { FormControl, FormErrorMessage, Input, FormLabel, Box, Button } from '@chakra-ui/core';
import { Wrapper } from './../components/Wrapper';
import { InputField } from './../components/InputField';
import {  useLoginMutation } from './../generated/graphql';
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from 'next/router';

const Login: React.FC<{}> = ({ }) => {
    const [, login] = useLoginMutation();
    const router = useRouter();
    return (
        <Wrapper variant="small">
            <Formik initialValues={{ username: "", password: "" }} onSubmit={ async (values, {setErrors}) => {
                console.log(values);
                const response = await login({input: values});
                if(response.data?.login?.errors){
                    setErrors(toErrorMap(response.data.login.errors));
                }
                else if(response.data?.login.user){
                    console.log(response.data);
                    router.push('/');
                }
            }}>
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='username' placeholder='username' label='Username' ></InputField>
                        <Box mt={4}>
                            <InputField name='password' placeholder='password' label='Password' type="password" ></InputField>
                        </Box>
                        <Button mt={4} type='submit' variantColor="teal" isLoading={isSubmitting}>login</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default Login;