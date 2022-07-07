import {Msg} from "./Msg";
const { StatusCode } = require('status-code-enum')


class AppStartedSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return{
            status: StatusCode.SuccessOK,
            msg: "Success OK - App was successfully launched"
        }
    }
}

class NewVaxSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessCreated,
            msg: "Success Created - New vaccine created successfully"
        }
    }
}

class NewDeliveryWithNDosesSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessCreated,
            msg: "Success Created - New delivery with the required number of doses created successfully"
        }
    }
}

class VaxListSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Vax list is successfully displayed"
        }
    }
}


export enum SuccessMsgEnum {
    AppStarted,
    NewVax,
    NewDeliveryWithNDosesSuccessMsg,
    VaxList
}

export function getSuccessMsg(type: SuccessMsgEnum): Msg{
    let msgval: Msg;
    switch(type){
        case SuccessMsgEnum.AppStarted:
            msgval = new AppStartedSuccessMsg();
            break;
        case SuccessMsgEnum.NewVax:
            msgval = new NewVaxSuccessMsg();
            break;
        case SuccessMsgEnum.NewDeliveryWithNDosesSuccessMsg:
            msgval = new NewDeliveryWithNDosesSuccessMsg();
            break;
        case SuccessMsgEnum.VaxList:
            msgval = new VaxListSuccessMsg();
            break;
    }
    return msgval;
}
