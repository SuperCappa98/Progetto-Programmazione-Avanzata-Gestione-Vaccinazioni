import * as JwtMiddleware from './jwt_middleware';
import * as errorHandler from './error_handlers';
import * as vaxMiddleware from './vax_middleware';


/**
 * Chain of responsability to call middlewares 
 */

 export const jwt = [
    JwtMiddleware.checkHeader,
    JwtMiddleware.checkToken,
    JwtMiddleware.verifyAndAuthenticate,
    errorHandler.errorHandlerUnauth
]

export const jwtPayload = [
    JwtMiddleware.checkJwtPayload,
    errorHandler.errorHandlerBadRequest
]

export const checkAdmin = [
    JwtMiddleware.checkAdmin,
    errorHandler.errorHandlerUnauth
]

export const checkVaxData = [
    vaxMiddleware.checkVaxData,
    errorHandler.errorHandlerBadRequest
]


