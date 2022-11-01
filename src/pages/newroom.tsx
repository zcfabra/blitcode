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
    const [joinedRoom, setJoinedRoom] = useState<string|null>(null);
    const [createRoom, setCreateRoom] = useState<boolean>(false);
    const [code, setCode] = useState<string>("")
 
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

            socket.on("rejected-from-room", (roomName, message)=>{
                console.log("REJECTED FROM ROOM ", roomName)

                console.log(message)
            })

        }
            )()
    }, []);


    const handleRoomRequest = () =>{
        createRoom ? socket.emit("create-room", roomName, password) : socket.emit("request-join-room", roomName, password)
    }


    const handleRunCode = async ()=>{
        const res = await fetch("/api/run").then(res=>console.log(res.json()))
    }
  return (
    <div className={`w-full h-screen bg-black text-purple-500 flex flex-col items-center ${joinedRoom ? "p-8" : "p-24"}`}>
        {!connected ? (<>
        <h1 className='text-8xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500'>Hop In</h1>
        <div className='w-10/12 flex flex-col'>
            <input value={roomName} onChange={(e)=>setRoomName(e.target.value.replaceAll(" ", ""))}placeholder="Room Name" className="w-full px-4 h-16 bg-transparent mb-2 text-white rounded-md border border-purple-500" type="text"/>
            <div className='flex flex-row items-center mb-8'><span className='text-gray-400 mr-2'>Create room?</span> <input checked={createRoom} onChange={()=>setCreateRoom(prev=>!prev)} type="checkbox"/></div>
            <input value={password} onChange={(e)=>setPassword(e.target.value)}placeholder="Password" className="w-full px-4  text-white h-16 bg-transparent mb-2 rounded-md border border-purple-500" type="text"/>
            <span className='mb-8 text-gray-400'>Leave blank if no password</span>
            <button onClick={handleRoomRequest}className='w-36 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-md ml-auto text-white'>{createRoom ? "Create" : "Join"}</button>
        </div>
        {/* <button onClick={()=>socket.emit("create-room",{room: "room",password:"abc"})}>Room Init</button>
        <button onClick={()=>socket.emit("request-join-room",{room: "room", password: "abc"})}>Hi</button> */}
       

    </>
    ) : (
        <div className=' w-full h-screen absolute top-0 flex flex-col'>
            <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500'>{joinedRoom}</h1>
            <div>
                <textarea value={code} onChange={(e)=>setCode(e.target.value)} name="ide" id="" cols="30" rows="10"></textarea>
                <button onClick={handleRunCode}className='w-24 h-12 bg-purple-500 text-white rounded-md'>Run</button>
            </div>
        </div>
        )}
    </div>
  )
}

export default NewRoom