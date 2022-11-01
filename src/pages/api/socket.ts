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

            s.on("create-or-join", (roomName, password)=>{
                const stored_password = kv.get(roomName);
                if (stored_password){
                    if (stored_password == password){
                        s.emit("accepted-into-room", roomName);
                    } else {
                        s.emit("rejected-from-room", roomName)
                    }
                } else {
                    kv.set(roomName, password);
                    s.emit("accepted-into-room", roomName);
                }
            })
        })
        
    }






    res.end();

}