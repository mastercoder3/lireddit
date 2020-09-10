import React from 'react';
import { Formik, Form } from 'formik';
import { FormControl, FormErrorMessage, Input, FormLabel, Box, Button } from '@chakra-ui/core';
import { Wrapper } from './../components/Wrapper';
import { InputField } from './../components/InputField';
import { useRegisterMutation } from './../generated/graphql';
import { toErrorMap } from "../utils/toErrorMap";

interface registerProp {

}

const Register: React.FC<registerProp> = ({ }) => {
    const [, register] = useRegisterMutation();
    return (
        <Wrapper variant="small">
            <Formik initialValues={{ username: "", password: "" }} onSubmit={ async (values, {setErrors}) => {
                console.log(values);
                const response = await register(values);
                if(response.data?.register?.errors){
                    setErrors(toErrorMap(response.data.register.errors));
                }
            }}>
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='username' placeholder='username' label='Username' ></InputField>
                        <Box mt={4}>
                            <InputField name='password' placeholder='password' label='Password' type="password" ></InputField>
                        </Box>
                        <Button mt={4} type='submit' variantColor="teal" isLoading={isSubmitting}>register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default Register;