/**
 * Class 'SingleVax'
 * 
 * Class that has as its property the required vaccine statistics from the '/statistics' route
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

