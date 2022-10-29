import { NextPage } from 'next'
import React from 'react'
import {Formik, Form, Field} from "formik"
import io from "socket.io-client"

const NewRoom: NextPage= () => {
    let socket;

    const handleConnect = async () =>{
        const res = await fetch("/api/socket");
        socket = io();

        socket.on("connect", ()=>{
            console.log("connected");
        })
    }
    
  return (
    <div className='w-full h-screen bg-black text-purple-500 flex flex-col items-center p-24'>
        <h1 className='text-8xl font-bold mb-16'>New Room</h1>
        <Formik initialValues={{name: "", password: ""}} onSubmit={(values)=>{
            console.log(values);
        }}>
            {()=>(
                <Form className='flex flex-col items-center w-8/12'>
                    <Field placeholder="Room Name" className="w-full px-4 my-4 h-16 border border-purple-500 text-white rounded-md bg-transparent" name="name"></Field>
                    <Field placeholder="Password"  className="w-full px-4 my-4 h-16 border border-purple-500 text-white rounded-md bg-transparent" name="password"></Field>
                    <button onClick={()=>handleConnect()} className='w-36 mt-16 ml-auto h-16 text-white bg-gradient-to-r from-purple-500 to-orange-500 rounded-md text-xl font-light' type="submit">Create</button>
                </Form>
            )}
        </Formik>

    </div>
  )
}

export default NewRoom