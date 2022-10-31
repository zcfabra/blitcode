import { NextPage, NextPageContext } from 'next';
import React, { useEffect, useState } from 'react'
import {io, Socket} from "socket.io-client"

interface RoomProps{
    id: string
}

type Message={
    sentBy: string,
    message: string
}
let socket:Socket;

const Room: NextPage = () => {
    const [roomName, setRoomName] = useState<string>("");
    const [username, ] = useState<string>(`name${Math.floor(Math.random() * 10)}`)
    const [message, setMessage] = useState<Message>({sentBy: username, message: ""});
    // const [socket, setSocket] = useState<Socket>();
    const [messageLog, setMessageLog] = useState<Message[]>([]);

    useEffect(()=>{

        const handler = (item: Message)=>{
            console.log("hi")
            setMessageLog(prev=>[...prev, item])
            console.log(Math.random()* 10)
        }

        (async ()=>{
            await fetch("/api/socket")
            socket = io();
            socket.on("connect", ()=>{
                console.log("POWPOW")
            });
            socket.on("receive-message", handler);

        })();
    }, [])




    const handleMessageSend = (e: React.MouseEvent<HTMLButtonElement>)=>{
        // console.log(message);
        socket.emit("send-message", message)



    }

    const handleJoinRoom =  () =>{
        socket?.emit("join-room", roomName);
    }


  return (
    <div className='w-full h-screen bg-black text-purple-500 flex flex-col items-center'>
        <h1 className='mt-8 text-4xl font-bold'>Room</h1>

        <input value={roomName} onChange={(e)=>setRoomName(e.target.value)} type="text" />
        <button onClick={handleJoinRoom}>Join</button>
        <input value={message.message} onChange={(e)=>setMessage(prev=>{
            return {sentBy: username,
            message: e.target.value}
        })} type="text" />
        <button onClick={handleMessageSend}>Send</button>

        <div className='w-full  h-3/6 overflow-y-scroll'>
            {messageLog.map((i,ix)=>(
                <div className={`w-full h-24 my-4 flex flex-row ${username == i.sentBy ? "justify-end" : "justify-start"}`}>
                    <div className='w-4/12 h-full bg-white text-black flex flex-col p-4'>
                        <span className=' text-xs font-light'>{i.sentBy}</span>
                        <span className=' text-lg'>{i.message}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}


// export async function getServerSideProps({req, query}:NextPageContext){

//     console.log(query)

//     return {props:{id: query.id}}
// }

export default Room;