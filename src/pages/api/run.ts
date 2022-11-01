import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import {spawn} from "node:child_process";
import { cwd } from "node:process";
// const proc = spawn("python3", [cwd() + "/src/pages/api/test.py"], {stdio:"inherit"});

// proc.stdout?.on("data", (data)=>{
//     console.log(data);
// });

// proc.stderr?.on("error", err=>{
//     console.log(err)
// })

// proc.stdin?.on("", ()=>{
//     console.log("HOWDY")
// })

export const proc = spawn("python3", [], {stdio: ["pipe", "pipe", "inherit"]});

proc.stdout?.on("data", data=>{
    console.log(data.toString())
})

proc.stdout?.on("close", ()=>{
    console.log("CLOSED")
})

proc.stdout?.on("end", ()=>{
    console.log("END")
})

export const RunCode: NextApiHandler =  (req: NextApiRequest, res: NextApiResponse)=>{
    // console.log("HI")
    // console.log(req.body)
    proc.stdin?.cork();
    proc.stdin?.write(req.body["data"] + "\r\n")
    proc.stdin?.uncork();






    res.send({data:"boo"})
}

export default RunCode