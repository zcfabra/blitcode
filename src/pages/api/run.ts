import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import {exec, execSync, spawn} from "node:child_process";
import { cwd } from "node:process";


// export const proc = spawn("python3", [], {stdio: ["pipe", "pipe", "inherit"]});

// proc.stdout?.on("data", data=>{
//     console.log(data.toString())
// })

// proc.stdout?.on("close", ()=>{
//     console.log("CLOSED")
// })

// proc.stdout?.on("end", ()=>{
//     console.log("END")
// })

export const RunCode: NextApiHandler =  (req: NextApiRequest, res: NextApiResponse)=>{
    console.log("HI")
    console.log("DATA: ",req.body["data"])
    // const proc = spawn("python3", [], {stdio: ["pipe", "pipe", "pipe"]});
    // var out;
    // proc.stdout.on("data", (data)=>{
    //     // console.log(data.toString())
    //     out = data.toString();
    //     // res.setHeader("Content-Type", "application/json")
    //     res.status(200).json({data: out});
    //     return;
    // });
    // proc.stdout.on("error", err=>{
    //     console.log(err)
    //     res.status(200).json({data: err})
    // })
    // proc.stderr.on("data", err=>{
    //     res.status(200).json({data: err.toString()})
    // })

    // proc.stdin.write(req.body["data"]);
    // proc.stdin.end();

    // res.status(404).send({data: "error"});
    try {

        let proc = execSync("python3", {input: req.body["data"], stdio:["pipe", "pipe", "pipe"]});
        res.status(200).json({data: proc.toString()});
    } catch (e: any){
        console.log(e)
        res.status(200).json({data: e.stderr.toString()})
    }
   
    
    // console.log(proc.toString())


    
}

export default RunCode