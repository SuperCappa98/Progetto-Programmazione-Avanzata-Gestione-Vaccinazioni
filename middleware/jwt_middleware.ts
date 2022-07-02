require('dotenv').config();
import * as jwt from 'jsonwebtoken';
const { StatusCode } = require('status-code-enum')


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
            let error = new Error("No request header");
            next(error);
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
            let error = new Error("Request header undefined") 
            next(error)
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
            let error = new Error("Authentication Error") 
            next(error);
        }
    }catch(error){
        next(error);
    }
};

export const errorHandler =  (err: Error, req: any, res: any, next: any) => {
    res.status(StatusCode.ClientErrorUnauthorized).send({"error": err.message});
};


export const checkUserRole = (req: any, res: any, next: any) => {
    try{
        
        next();
        
    }catch(error){
        next(error);
    }
};