/*
class SingleVax {
    vaccine: string;
    min_vaccinations: number;
    max_vaccinations: number;
    mean_vaccinations: number;
    dev_vaccinations: number;
    mean_delivery: number


    //constructor 
    constructor(vaccine:string, min:number, max:number, mean:number, dev:number) { 
        this.vaccine = vaccine;
        this.min = min;
        this.max = max;
        this.mean = mean;
        this.dev = dev;
     }  
}
*/

export class SingleVax {
    vaccine: any;
    min_vaccinations: any;
    max_vaccinations: any;
    mean_vaccinations: any;
    dev: any;
    mean_delivery: any;
 
    //constructor 
    constructor(vaccine:any, min_vaccinations:any, max_vaccinations:any, mean_vaccinations:any, dev:any, mean_delivery: any) { 
        this.vaccine = vaccine;
        this.min_vaccinations = min_vaccinations;
        this.max_vaccinations = max_vaccinations;
        this.mean_vaccinations = mean_vaccinations;
        this.dev = dev;
        this.mean_delivery = mean_delivery;
     }  
}

