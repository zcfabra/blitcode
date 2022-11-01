import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import {Formik, Form, Field} from "formik"
import io, { Socket } from "socket.io-client"
import { useRouter } from 'next/router'


let socket:Socket;
const NewRoom: NextPage= () => {
    const router = useRouter()
    const [connected, setConnected] = useState<boolean>(false);
    const [roomName, setRoomName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [joinedRoom, setJoinedRoom] = useState<string|null>(null)
 
    useEffect(()=>{
        (async()=>{
            await fetch("/api/socket").then(res=>console.log(res));
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
                setJoinedRoom(room);
            });

            socket.on("rejected-from-room", ()=>{
                console.log("REJECTED FROM ROOM")
            })

        }
            )()
    }, []);


    const handleRoomRequest = ()=>{
        socket.emit("create-or-join", roomName, password);
    }


    
  return (
    <div className='w-full h-screen bg-black text-purple-500 flex flex-col items-center p-24'>
        {!connected ? (<>
        <h1 className='text-8xl font-bold mb-16'>Hop In</h1>
        <div className='w-10/12 flex flex-col'>
            <input value={roomName} onChange={(e)=>setRoomName(e.target.value.replaceAll(" ", ""))}placeholder="Room Name" className="w-full px-4 h-16 bg-transparent mb-2 text-white rounded-md border border-purple-500" type="text"/>
            <span className='mb-8 text-gray-400'>Will create room with given name if it doesn&apos;t exist</span>
            <input value={password} onChange={(e)=>setPassword(e.target.value)}placeholder="Password" className="w-full px-4  text-white h-16 bg-transparent mb-2 rounded-md border border-purple-500" type="text"/>
            <span className='mb-8 text-gray-400'>Leave blank if no password</span>
            <button onClick={handleRoomRequest}className='w-36 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-md ml-auto text-white'>Join</button>
        </div>
        {/* <button onClick={()=>socket.emit("create-room",{room: "room",password:"abc"})}>Room Init</button>
        <button onClick={()=>socket.emit("request-join-room",{room: "room", password: "abc"})}>Hi</button> */}
       

    </>
    ) : (
        <div className='bg-red-500'>
            <h1>{joinedRoom}</h1>
        </div>
        )}
    </div>
  )
}

export default NewRoom