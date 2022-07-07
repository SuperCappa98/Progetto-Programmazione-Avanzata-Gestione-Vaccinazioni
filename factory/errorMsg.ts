import {Msg} from "./Msg";
const { StatusCode } = require('status-code-enum')


class MissingTokenErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Request header undefined: missing JWT Token"
        }
    }
}

class NoHeaderErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - No request authorization header"
        }
    }
}

class InvalidTokenErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorForbidden,
            msg: "Forbidden - Authentication Error: invalid JWT Token"
        }
    }
}

class BadFormattedUserDataInJWTPayloadErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Formatting Error: user data in the JWT payload are bad formatted"
        }
    }
}

class UnauthorizedErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorUnauthorized,
            msg: "Unauthorized - Authorization Error: you are not an Admin"
        }
    }
}

class InternalServerErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ServerErrorInternal,
            msg: "Internal Server Error"
        }
    }
}

class FieldValueAlreadyExistsErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorConflict,
            msg: "Conflict - This field value already exists"
        }
    }
}

class BadFormattedDataErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Formatting Error: data are bad formatted"
        }
    }
}

class NotValidValueErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Not Valid Value Error"
        }
    }
}

class NotFoundInDBErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorNotFound,
            msg: "Not found - Not found relative field value in the database"
        }
    }
}

class NotPositiveIntErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Not Positive Int Error: this field must be a positive integer"
        }
    }
}

class InvalidArrayLengthErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Range Error: invalid array length"
        }
    }
}


export enum ErrorMsgEnum {
    MissingToken,
    NoHeader,
    InvalidToken,
    BadFormattedUserDataInJWTPayload,
    Unauthorized,
    InternalServer,
    FieldValueAlreadyExists,
    BadFormattedData,
    NotValidValue,
    NotFoundInDB,
    NotPositiveInt,
    InvalidArrayLength
}

export function getErrorMsg(type: ErrorMsgEnum): Msg{
    let msgval: Msg;
    switch(type){
        case ErrorMsgEnum.MissingToken:
            msgval = new MissingTokenErrorMsg();
            break;
        case ErrorMsgEnum.NoHeader:
            msgval = new NoHeaderErrorMsg();
            break;
        case ErrorMsgEnum.InvalidToken:
            msgval = new InvalidTokenErrorMsg();
            break;
        case ErrorMsgEnum.BadFormattedUserDataInJWTPayload:
            msgval = new BadFormattedUserDataInJWTPayloadErrorMsg();
            break;
        case ErrorMsgEnum.Unauthorized:
            msgval = new UnauthorizedErrorMsg();
            break;
        case ErrorMsgEnum.InternalServer:
            msgval = new InternalServerErrorMsg();
            break;
        case ErrorMsgEnum.FieldValueAlreadyExists:
            msgval = new FieldValueAlreadyExistsErrorMsg();
            break;
        case ErrorMsgEnum.BadFormattedData:
            msgval = new BadFormattedDataErrorMsg();
            break;
        case ErrorMsgEnum.NotValidValue:
            msgval = new NotValidValueErrorMsg();
            break;
        case ErrorMsgEnum.NotFoundInDB:
            msgval = new NotFoundInDBErrorMsg();
            break;
        case ErrorMsgEnum.NotPositiveInt:
            msgval = new NotPositiveIntErrorMsg();
            break;
        case ErrorMsgEnum.InvalidArrayLength:
            msgval = new InvalidArrayLengthErrorMsg();
}
    console.log(msgval);
    return msgval;
}