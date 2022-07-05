import {ErrorMsgEnum, getErrorMsg} from "../factory/errorMsg";


export const errorHandler =  (err: ErrorMsgEnum, req: any, res: any, next: any) => {
    const err_msg = getErrorMsg(err).getMsg();
    console.log(err_msg);
    res.status(err_msg.status).json({Error: err_msg.status, Description:err_msg.msg});
};