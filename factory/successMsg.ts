import {Msg} from "./Msg";
const { StatusCode } = require('status-code-enum')


class NewVaxMsg implements Msg {
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessCreated,
            msg: "Success Created - New vax created successfully"
        }
    }
}


export enum SuccessMsgEnum {
    NewVax
}

export function getSuccessMsg(type: SuccessMsgEnum): Msg{
    let msgval: Msg;
    switch(type){
        case SuccessMsgEnum.NewVax:
            msgval = new NewVaxMsg();
            break;
    }
    return msgval;
}
