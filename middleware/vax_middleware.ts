
import {Vaccine} from "../models/Vaccine";

// check vax data types and check no other vaccine in db with the same name
export const checkVaxData = async (req: any, res: any, next: any) => {
    try{
        console.log("request body: ", req.body);
        if(isNaN(req.body.vaxName) && Number.isInteger(req.body.coverage)){
            const vaxName = req.body.vaxName.toLowerCase();
            console.log("vaxNameToLowerCase: ", vaxName);
            const nameDuplicated = await Vaccine.findOne({ where: { vaccine_name: vaxName } });           
            if (nameDuplicated === null) {
                next();
            }else{
                let error = new Error("Vax name already exists!");
                next(error);
            }         
        }else{
            let error = new Error("Vax data are bad formatted!");
            next(error);
        }
    }catch(error){
        next(error);
    }
};
