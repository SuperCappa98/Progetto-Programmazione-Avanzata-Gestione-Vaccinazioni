// Import libraries
import {ErrorMsgEnum, getErrorMsg} from "../factory/errorMsg";


/**
 * Middleware layer 'errorHandler'
 * 
 * Invoked as the final middleware layer in each Chain of Responsibility, 
 * returns in the response body the object created by the Factory {@link getErrorMsg} function of error messages 
 * 
 * @param err Error generated by the previous middleware layers
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer
 */
export const errorHandler =  (err: ErrorMsgEnum, req: any, res: any, next: any) => {
    const err_msg = getErrorMsg(err).getMsg();
    console.log(err_msg);
    res.status(err_msg.status).json({Error: err_msg.status, Description:err_msg.msg});
};