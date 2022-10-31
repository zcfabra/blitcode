import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import {Socket} from "net"
import {Server as NetServer} from "http"

const kv: Map<string, string | null> = new Map();

type NextApiResponseSocket =  NextApiResponse &  {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer
        }
    }
}


export default function SocketHandler (req: NextApiRequest , res: NextApiResponseSocket){
    if (res.socket && res.socket.server.io){
        console.log("already running");
    } else {
        const io = new SocketIOServer(res.socket.server);
        res.socket.server.io = io;

        io.on("connect", s=>{
            s.on("join-room", room=>{
                console.log(room)
            })

            s.on("send-message", (msg, room)=>{
                console.log(msg, room);
                io.to(room).emit("receive-message",msg)
            });

            s.on("create-room", (room)=>{
                kv.set(room.room,room.password);
                s.join(room.room);
                s.emit("accepted-into-room", room.room);
            })
            s.on("request-join-room", (room)=>{
                console.log("req made", room)
                if (kv.has(room.room)){
                    let stored_pass = kv.get(room.room);
                    console.log(stored_pass)
                    if (stored_pass){
                        if (room.password == stored_pass )
                        {
                            s.join(room.room)
                            s.emit("accepted-into-room", room.room)
                        } else {
                            s.emit("rejected-from-room");
                        }    
                    }
                }
            })
        })
        
    }






    res.end();

}