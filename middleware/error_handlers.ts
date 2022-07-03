const { StatusCode } = require('status-code-enum')


export const errorHandlerUnauth =  (err: Error, req: any, res: any, next: any) => {
    res.status(StatusCode.ClientErrorUnauthorized).send({"error": err.message});
};

export const errorHandlerBadRequest =  (err: Error, req: any, res: any, next: any) => {
    res.status(StatusCode.ClientErrorBadRequest).send({"error": err.message});
};

