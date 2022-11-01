import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import {Formik, Form, Field} from "formik"
import io, { Socket } from "socket.io-client"
import { useRouter } from 'next/router'
import { pythonLanguage } from '@codemirror/lang-python'

import ReactCodeMirror from '@uiw/react-codemirror'


let socket:Socket;
const NewRoom: NextPage= () => {
    const router = useRouter()
    const [connected, setConnected] = useState<boolean>(false);
    const [roomName, setRoomName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [joinedRoom, setJoinedRoom] = useState<string|null>(null);
    const [createRoom, setCreateRoom] = useState<boolean>(false);
    const [code, setCode] = useState<string>("");
    const [print, setPrint] = useState<string>("");
    const [runShortcut, setRunShortcut] = useState<{first: boolean, enter: boolean}>({first: false, enter: false});

    useEffect(()=>{
        if (runShortcut.first && runShortcut.enter){
            handleRunCode();
        }
    }, [runShortcut])
 
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
        const res = await fetch("/api/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({data: code})
        }).then(res=>res.json())

        setPrint(res["data"])
    }

    const onChange = React.useCallback((value: string, viewUpdate: any)=>{
        setCode(value);
    }, []);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>)=>{
        if ((e.key == "Ctrl" || e.key == "Meta" )){

            setRunShortcut(prev=>({...prev,["first"]: true}))
        }

        if (e.key == "Enter"){
            if (runShortcut.first){
                e.preventDefault();
            }

            setRunShortcut(prev=>({...prev, ["enter"]: true}))
        }
    }
    const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>)=>{
        if ((e.key == "Ctrl" || e.key == "Meta")){
            setRunShortcut(prev=>({...prev,["first"]: false}))

        }
        if (e.key == "Enter"){
            setRunShortcut(prev=>({...prev, ["enter"]: false}))
        }
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
            <div className='w-full '>
                <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500'>{joinedRoom}</h1>
            </div>
            <div className='w-full flex flex-row h-5/6'>
            <div className='relative w-6/12 flex flex-col h-full'>
               <ReactCodeMirror
               extensions={[pythonLanguage]}
               onKeyDown={handleKeyDown}
               onKeyUp={handleKeyUp}
                className="h-full"
                height='100%'
               theme="dark"
               onChange={onChange}
               />
               <button onClick={handleRunCode} className=' absolute bottom-0 w-20 h-12 bg-gradient-to-r from-purple-500 to-orange-500 ml-auto  rounded-md text-white'>Run</button>
            </div>
            <div className='w-6/12 h-full bg-gray-900 p-4 overflow-y-scroll text-white'>
                <span className='whitespace-pre-line'>{print}</span>

            </div>
            </div>
            
        </div>
        )}
    </div>
  )
}

export default NewRoom