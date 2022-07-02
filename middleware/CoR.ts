import * as JwtMiddleware from './jwt_middleware';
// import * from './vax_middleware';


/**
 * Chain of responsability to call middlewares 
 */

 export const JWT = [
    JwtMiddleware.checkHeader,
    JwtMiddleware.checkToken,
    JwtMiddleware.verifyAndAuthenticate,
    JwtMiddleware.errorHandler
]
