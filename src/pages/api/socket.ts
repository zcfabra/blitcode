import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import {Socket} from "net"
import {Server as NetServer} from "http"
import redis from "../../lib/redis";

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
                io.to(room).emit("get-message",msg)
            });

            s.on("update-code", async (code, room)=>{
                console.log(code, room);
                await redis.set(room, code);
                io.to(room).emit("get-code-update", code)
            });

            // s.on("create-or-join", (roomName, password)=>{
            //     const stored_password = kv.get(roomName);
            //     if (stored_password){
            //         console.log("JOINED")
            //         if (stored_password == password){
            //             s.emit("accepted-into-room", roomName);
            //         } else {
            //             s.emit("rejected-from-room", roomName)
            //         }
            //     } else {
            //         console.log("CREATED")
            //         kv.set(roomName, password);
            //         s.emit("accepted-into-room", roomName);
            //     }
            // })

            s.on("request-join-room", async (roomName, password)=>{
                const stored_password = kv.get(roomName);
                if (!stored_password){

                    s.emit("rejected-from-room", roomName, "Room does not exist");
                    return
                }
                if (password != stored_password){
                    s.emit("rejected-from-room", roomName, "Wrong password");
                    return
                }
                s.join(roomName);
                const code =  await redis.get(roomName);
                console.log(code)
                if (code) {
                    s.emit("get-code-update", await redis.get(roomName))
                }
                s.emit("accepted-into-room", roomName)
            })

            s.on("create-room", (roomName, password)=>{
                const stored_password = kv.get(roomName);
                let newRoomName = roomName;
                if (stored_password){
                    let idx = 2
                    newRoomName = roomName+String(idx);
                    while (kv.get(newRoomName)){
                        idx++;
                        newRoomName = roomName + String(idx);
                    }
                } 

                kv.set(newRoomName, password);
                s.join(roomName)
                s.emit("accepted-into-room", newRoomName);
            })
        })
        
    }






    res.end();

}