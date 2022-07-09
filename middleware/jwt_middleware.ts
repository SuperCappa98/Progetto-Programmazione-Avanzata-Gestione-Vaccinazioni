require('dotenv').config();
import * as jwt from 'jsonwebtoken';
import {ErrorMsgEnum} from "../factory/errorMsg";


/**
 * @param req request from client
 * @param res response from server
 * @param next calls the next middleware     
 */


// Check request header 
export const checkHeader = (req: any, res: any, next: any) => {
    
    const authHeader = req.headers.authorization;
    if(authHeader){
        next();
    } else {
        next(ErrorMsgEnum.NoHeader);
    }
    
};

// Get token from request header
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

// Check token key and decoded payload
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

// Check sintax of token fields and user role (admin/user)
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

// 
export const checkAdmin = (req: any, res: any, next: any) => {
    
    if(req.user.role === "Admin"){
        next();
    }else{
        next(ErrorMsgEnum.Unauthorized);
    }
   
};