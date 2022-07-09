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

class AvailableDosesSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Doses of the required vaccine are still available"
        }
    }
}

class NotAvailableDosesSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - No doses of the required vaccine are currently available"
        }
    }
}

class FilterAvailableDosesSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Given vaccine still has the required number of doses"
        }
    }
}

class FilterNotAvailableDosesSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Required number of doses of the given vaccine are not currently available"
        }
    }
}

class NewVaccinationSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessCreated,
            msg: "Succes Created - New vaccination inserted successfully and available doses decremented in the respective batch"
        }
    }
}

class VaccinationsListSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Vaccinations list is successfully displayed"
        }
    }
}

class CoverageExpiredUserListSuccessMsg implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Coverage expired user list is successfully displayed"
        }
    }
}

export enum SuccessMsgEnum {
    AppStarted,
    NewVax,
    NewDeliveryWithNDoses,
    VaxList,
    AvailableDoses,
    NotAvailableDoses,
    FilterAvailableDoses,
    FilterNotAvailableDoses,
    NewVaccination,
    VaccinationsList,
    CoverageExpiredUserList
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
        case SuccessMsgEnum.NewDeliveryWithNDoses:
            msgval = new NewDeliveryWithNDosesSuccessMsg();
            break;
        case SuccessMsgEnum.VaxList:
            msgval = new VaxListSuccessMsg();
            break;
        case SuccessMsgEnum.AvailableDoses:
            msgval = new AvailableDosesSuccessMsg();
            break;
        case SuccessMsgEnum.NotAvailableDoses:
            msgval = new NotAvailableDosesSuccessMsg();
            break;
        case SuccessMsgEnum.FilterAvailableDoses:
            msgval = new FilterAvailableDosesSuccessMsg();
            break;
        case SuccessMsgEnum.FilterNotAvailableDoses:
            msgval = new FilterNotAvailableDosesSuccessMsg();
            break;
        case SuccessMsgEnum.NewVaccination:
            msgval = new NewVaccinationSuccessMsg();
            break;
        case SuccessMsgEnum.VaccinationsList:
            msgval = new VaccinationsListSuccessMsg();
            break;
        case SuccessMsgEnum.CoverageExpiredUserList:
            msgval = new CoverageExpiredUserListSuccessMsg();
            break;
    }
    return msgval;
}
