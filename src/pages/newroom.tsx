import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import {Formik, Form, Field} from "formik"
import io, { Socket } from "socket.io-client"
import { useRouter } from 'next/router'
import { pythonLanguage } from '@codemirror/lang-python'

import ReactCodeMirror from '@uiw/react-codemirror'

type Message= {
    sender: string,
    message:string
}

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
    const [message, setMessage] = useState<string>("");
    const [messageLog, setMessageLog] = useState<Message[]>([]);
    const [username, setUserName] = useState<string>(`name${Math.floor(Math.random() * 10)}`)

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

            socket.on("get-code-update", CODE=>{
                console.log("HIT")
                console.log("HI",CODE)
                setCode(CODE);
            });

            socket.on("get-message", msg=>{
                console.log(msg)
                setMessageLog(prev=>[...prev, msg])
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
    }, [setCode]);


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
        socket.emit("update-code",value, roomName)
    }, [socket, roomName]);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>)=>{
        if ((e.key == "Control")){

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

    const handleMessageSend = ()=>{
        socket.emit("send-message", {sender: username, message: message}, roomName);
        setMessage("")
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
        <div className=' w-full h-screen absolute top-0 flex bg-black flex-col'>
            <div className='w-full flex flex-row h-full '>
                <div className='relative w-6/12 flex flex-col h-full'>
                <ReactCodeMirror
                value={code}
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
            <div className='w-6/12 h-full bg-black overflow-y-scroll text-white flex flex-col'>
                <div className='w-full h-3/6 flex flex-col p-4'>
                    <span className='font-bold text-xl mb-2'>Console for {roomName}</span>
                    <div className='h-full overflow-y-scroll text-light'>
                        <span className='whitespace-pre-line'>{print}</span>
                    </div>
                </div>
                <div className='relative w-full h-3/6  border-t border-gray-300'>
                    <div className='w-full h-5/6 overflow-scroll'>
                        {messageLog.map((i,ix)=>(
                            <div key={ix}className={`w-full h-24 flex flex-col p-4 ${i.sender == username? "items-end" : "items-start"} `}>
                                <span className='text-xs font-light'>{i.sender}</span>
                                <span>{i.message}</span>

                            </div>
                        ))}
                    </div>
                    <div className='w-full h-24 p-4 absolute bottom-0 flex flex-row'>
                        <input value={message} onChange={(e)=>setMessage(e.target.value)} className='w-10/12 rounded-l-md border bg-transparent border-gray-500 text-white px-4' type="text" />
                        <button onClick={()=>handleMessageSend()}className='w-2/12 bg-purple-500 rounded-r-md text-white'>Send</button>
                    </div>
                </div>

            </div>
            </div>
            
        </div>
        )}
    </div>
  )
}

export default NewRoom