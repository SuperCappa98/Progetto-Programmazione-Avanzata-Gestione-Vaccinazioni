import {Vaccine} from '../models/Vaccine';
import {ErrorMsgEnum, getErrorMsg} from "../factory/errorMsg";
import {SuccessMsgEnum, getSuccessMsg} from "../factory/successMsg";


function controllerErrors(err_msg_enum:ErrorMsgEnum, error:Error, res:any){
    const new_err_msg = getErrorMsg(err_msg_enum).getMsg();
    console.log(error);
    res.status(new_err_msg.status).json({Error:new_err_msg.status, Description:new_err_msg.msg});
}

// Insert new vax in database
export async function addVax(name: string, coverage: number, res: any): Promise<void> {
    try {
        console.log(name, coverage)
        name = name.toLowerCase()
        console.log(name, coverage)
        await Vaccine.create({ vaccine_name: name, coverage: coverage }).then((newVaccine:any) => {
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.NewVax).getMsg();   
            var new_vax = {Name:newVaccine.vaccine_name, Coverage:newVaccine.coverage}   
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, NewVax:new_vax})
        });
    }catch (error:any) {
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
} 
