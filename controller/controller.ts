import {Vaccine} from '../models/Vaccine';

// insert new vax in database
export async function addVax(name: string, coverage: number, res: any): Promise<void> {
    try {
        console.log(name, coverage)
        name = name.toLowerCase()
        console.log(name, coverage)
        await Vaccine.create({ vaccine_name: name, coverage: coverage }).then(() => {        
            res.send('new vax just inserted');

        });}catch (error:any) {
            res.send(error.message);
        }
    } 
