import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const RunCode: NextApiHandler = (req: NextApiRequest, res: NextApiResponse)=>{
    console.log(req)
}