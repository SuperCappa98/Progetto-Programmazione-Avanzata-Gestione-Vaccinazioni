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

class NewBatchWithNDosesSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessCreated,
            msg: "Success Created - New batch with the required number of doses created successfully"
        }
    }
}


export enum SuccessMsgEnum {
    AppStarted,
    NewVax,
    NewBatchWithNDosesSuccessMsg
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
        case SuccessMsgEnum.NewBatchWithNDosesSuccessMsg:
            msgval = new NewBatchWithNDosesSuccessMsg();
            break;
    }
    return msgval;
}
