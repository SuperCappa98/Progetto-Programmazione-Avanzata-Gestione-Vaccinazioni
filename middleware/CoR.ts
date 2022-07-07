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
    errorHandler.errorHandler
]

export const jwtPayload = [
    JwtMiddleware.checkJwtPayload,
    errorHandler.errorHandler
]

export const checkAdmin = [
    JwtMiddleware.checkAdmin,
    errorHandler.errorHandler
]

export const checkVaxData = [
    vaxMiddleware.checkVaxData,
    errorHandler.errorHandler
]

export const checkDosesData = [
    vaxMiddleware.checkDosesValue,
    vaxMiddleware.checkBatchValue,
    vaxMiddleware.checkDeliveryDate,
    vaxMiddleware.checkExpirationDate,
    vaxMiddleware.checkVaccineId,
    vaxMiddleware.checkDelivery,
    vaxMiddleware.checkBatchExpiration,
    errorHandler.errorHandler
]

export const vaxFilters = [
    vaxMiddleware.checkFilterVaxName,
    vaxMiddleware.checkFilterAvailability,
    vaxMiddleware.checkFilterExpirationDate,
    errorHandler.errorHandler
]

export const checkVaccinationData = [
    vaxMiddleware.checkUserKey,
    vaxMiddleware.checkBatchValue,
    vaxMiddleware.checkBatchKey,
    // vaxMiddleware.checkBatchAvailability,
   
    errorHandler.errorHandler
]