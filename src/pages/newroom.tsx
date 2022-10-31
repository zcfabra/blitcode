import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import {Formik, Form, Field} from "formik"
import io, { Socket } from "socket.io-client"
import { useRouter } from 'next/router'


let socket:Socket;
const NewRoom: NextPage= () => {
    const router = useRouter()
    const [connected, setConnected] = useState<boolean>(false);
    const [ room, setRoom] = useState<string  | null>(null);
    const [message, setMessage] = useState<string>("");
 
    useEffect(()=>{
        (async()=>{
            await fetch("/api/socket");
            socket = io();

            socket.on("connect",()=>{
                console.log("POWPOW");
                // setConnected(true);
            });

            socket.on("receive-message", msg=>{
                console.log(msg)
            })

            socket.on("accepted-into-room", room=>{
                console.log("ACCEPTED INTO ROOM ", room)
                setConnected(true)
                setRoom(room);
            });

            socket.on("rejected-from-room", ()=>{
                console.log("REJECTED FROM ROOM")
            })

        }
            )()
    }, [])


    
  return (
    <div className='w-full h-screen bg-black text-purple-500 flex flex-col items-center p-24'>
        {!connected ? (<>
        <h1 className='text-8xl font-bold mb-16'>Join Room</h1>
        <button onClick={()=>socket.emit("create-room",{room: "room",password:"abc"})}>Room Init</button>
        <button onClick={()=>socket.emit("request-join-room",{room: "room", password: "abc"})}>Hi</button>
       

    </>
    ) : (
        <div>
            <h1>{room}</h1>
            {room && (<>
                <input value={message} onChange={(e)=>setMessage(e.target.value)}type="text" />
                <button onClick={()=>{
                    socket.emit("send-message", message, room);
                }} className='bg-purple-500 w-36 h-16 rounded-md'></button>
                </>)}
        </div>
        )}
    </div>
  )
}

export default NewRoom