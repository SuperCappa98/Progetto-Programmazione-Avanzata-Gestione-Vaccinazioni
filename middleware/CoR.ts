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

export const checkVaxFilters = [
    vaxMiddleware.checkFilterVaxName,
    vaxMiddleware.checkFilterAvailability,
    vaxMiddleware.checkFilterExpirationDate,
    errorHandler.errorHandler
]

export const checkAvailableVaxDoses = [
    vaxMiddleware.checkVaxName,
    vaxMiddleware.checkFilterAvailability,
    errorHandler.errorHandler
]

export const checkVaccinationData = [
    vaxMiddleware.checkUserKey,
    vaxMiddleware.checkBatchValue,
    vaxMiddleware.checkBatchKey,
    vaxMiddleware.checkBatchAvailability,
    vaxMiddleware.checkBatchNotExpired,
    vaxMiddleware.checkUserNotCovered,
    errorHandler.errorHandler
]

export const checkTokenField = [
    vaxMiddleware.checkTokenField,
    errorHandler.errorHandler
]

export const checkFilterValue = [
    vaxMiddleware.checkFilterVaxNameJson,
    vaxMiddleware.checkVaccinationDate,
    errorHandler.errorHandler
]

export const checkCoverageExpiredUserListFilters = [
    vaxMiddleware.checkFilterVaxNameJson,
    vaxMiddleware.checkFilterNDaysCoverageExpired,
    errorHandler.errorHandler
]

export const checkCoverageDataUserFilters = [
    vaxMiddleware.checkFormat,
    vaxMiddleware.checkOrderByFilter,
    errorHandler.errorHandler
]

export const unexpectedRoute = [
    vaxMiddleware.routeNotFound,
    errorHandler.errorHandler
]