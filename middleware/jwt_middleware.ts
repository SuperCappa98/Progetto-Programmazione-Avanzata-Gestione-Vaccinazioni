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
    try{
        const authHeader = req.headers.authorization;
        if(authHeader){
            next();
        } else {
            next(ErrorMsgEnum.NoHeader);
        }
    }catch(error){
        next(error);
    }
};

// Get token from request header
export const checkToken = (req: any, res: any, next: any) => {
    try{
        const bearerHeader = req.headers.authorization;
        if(typeof bearerHeader!=='undefined'){
            const bearerToken = bearerHeader.split(' ')[1];
            req.token = bearerToken;
            next();
        }else{
            next(ErrorMsgEnum.MissingToken);
        }
    }catch(error){
        next(error);
    }
};

// Check token key and decoded payload
 export const verifyAndAuthenticate = (req: any, res: any, next: any) => {
    try{
        let decoded = jwt.verify(req.token, process.env.SECRET_KEY!);
        if(decoded !== null){
            req.user = decoded;
            next();
        }else{
            next(ErrorMsgEnum.InvalidToken);
        }
    }catch(error){
        next(error);
    }
};


// Check sintax of token fields and user role (admin/user)
export const checkJwtPayload = (req: any, res: any, next: any) => {
    try{
        console.log(req.user);
        if((req.user.role === "Admin" || req.user.role === "User") && (typeof req.user.name === "string") && (typeof req.user.surname === "string") && (req.user.userKey.length === 16) ){
            next();
        }else{
            next(ErrorMsgEnum.BadFormattedPayload);
        }
    }catch(error){
        next(error);
    }
};



export const checkAdmin = (req: any, res: any, next: any) => {
    try{
        if(req.user.role === "Admin"){
            next();
        }else{
            next(ErrorMsgEnum.Unauthorized);
        }
    }catch(error){
        next(error);
    }
};