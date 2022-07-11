/**
 * Interface 'Msg'
 * 
 * Declares the {@link getMsg} method that is implemented by the error and success messages in the related files.
 * Each class creates a message that will carry the fields "status" (status code of the HTTP response)
 * and "msg" (message to return to the Client in the response body)
 * 
 * @returns Object representing the message to be reported in the response body
 */
export interface Msg {
    getMsg():{status: number, msg: string};
}