// Import libraries
require('dotenv').config();
import * as jwt from 'jsonwebtoken';
import {ErrorMsgEnum} from "../factory/errorMsg";


/**
 * Middleware layer 'checkHeader'
 * 
 * Check request header 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkHeader = (req: any, res: any, next: any) => {    
    const authHeader = req.headers.authorization;
    if(authHeader){
        next();
    } else {
        next(ErrorMsgEnum.NoHeader);
    }   
};

/**
 * Middleware layer 'checkToken'
 * 
 * Check and if positive get token from request header 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkToken = (req: any, res: any, next: any) => {
    try{
    const bearerHeader = req.headers.authorization;
    if(typeof bearerHeader!== 'undefined'){
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    }
    }catch(error){
        next(ErrorMsgEnum.MissingToken);
    }    
};

/**
 * Middleware layer 'verifyAndAuthenticate'
 * 
 * Check token key and decode payload 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
 export const verifyAndAuthenticate = (req: any, res: any, next: any) => {
    try{
        let decoded = jwt.verify(req.token, process.env.SECRET_KEY!);
        if(decoded !== null){
            req.user = decoded;
            next();
        }
    }catch(error){
        next(ErrorMsgEnum.InvalidToken);
    }
};

/**
 * Middleware layer 'checkJwtPayload'
 * 
 * Check sintax of token fields and user role (Admin/User) 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkJwtPayload = (req: any, res: any, next: any) => {
    console.log(req.user);
    if((req.user.role === "Admin" || req.user.role === "User") 
        && (typeof req.user.name === "string") 
        && (typeof req.user.surname === "string") 
        && (req.user.userKey.length === 16) ){
        next();
    }else{
        next(ErrorMsgEnum.BadFormattedUserDataInJWTPayload);
    }
};

/**
 * Middleware layer 'checkAdmin'
 * 
 * Check if user role is Admin 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkAdmin = (req: any, res: any, next: any) => {
    if(req.user.role === "Admin"){
        next();
    }else{
        next(ErrorMsgEnum.Unauthorized);
    }  
};