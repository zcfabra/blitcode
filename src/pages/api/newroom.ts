import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";




const  NewRoom: NextApiHandler = (req: NextApiRequest,res: NextApiResponse)=>{
    console.log("HI", req)

    res.status(200).json({data: 90})

}

export default NewRoom;