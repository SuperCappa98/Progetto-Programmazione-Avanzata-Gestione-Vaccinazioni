import {Msg} from "./Msg";
const { StatusCode } = require('status-code-enum')


class NoHeaderErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - No request authorization header"
        }
    }
}

class MissingTokenErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Request header undefined: missing JWT Token"
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

class BadFormattedPayloadErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Formatting Error: user data are bad formatted"
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

class VaxNameErrorMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorConflict,
            msg: "Conflict - Vaccine name already exists"
        }
    }
}

class BadFormattedVaxDataErrorMsg implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Formatting Error: vaccine data are bad formatted"
        }
    }
}


export enum ErrorMsgEnum {
    NoHeader,
    MissingToken,
    InvalidToken,
    BadFormattedPayload,
    Unauthorized,
    InternalServer,
    VaxName,
    BadFormattedVaxData
}

export function getErrorMsg(type: ErrorMsgEnum): Msg{
    let msgval: Msg;
    switch(type){
        case ErrorMsgEnum.NoHeader:
            msgval = new NoHeaderErrorMsg();
            break;
        case ErrorMsgEnum.MissingToken:
            msgval = new MissingTokenErrorMsg();
            break;
        case ErrorMsgEnum.InvalidToken:
            msgval = new InvalidTokenErrorMsg();
            break;
        case ErrorMsgEnum.BadFormattedPayload:
            msgval = new BadFormattedPayloadErrorMsg();
            break;
        case ErrorMsgEnum.Unauthorized:
            msgval = new UnauthorizedErrorMsg();
            break;
        case ErrorMsgEnum.InternalServer:
            msgval = new InternalServerErrorMsg();
        case ErrorMsgEnum.VaxName:
            msgval = new VaxNameErrorMsg();
        case ErrorMsgEnum.BadFormattedVaxData:
            msgval = new BadFormattedVaxDataErrorMsg();
    }
    return msgval;
}