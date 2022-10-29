import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import {Socket} from "net"
import {Server as NetServer} from "http"


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
        console.log("ROOMS",res.socket.server.io.sockets.adapter.rooms);
    } else {
        const io = new SocketIOServer(res.socket.server);
        res.socket.server.io = io;
    }
    res.end();

}