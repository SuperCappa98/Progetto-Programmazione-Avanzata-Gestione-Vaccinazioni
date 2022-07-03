export const checkVaxData = (req: any, res: any, next: any) => {
    try{
        console.log("request body: ", req.body);
        if(isNaN(req.body.vaxName) && Number.isInteger(req.body.coverage)){
            next();
        }else{
            let error = new Error("Vax data are bad formatted!");
            next(error);
        }
    }catch(error){
        next(error);
    }
};
