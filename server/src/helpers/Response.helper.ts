import { StatusCodes } from "http-status-codes";

class ResponseHelper<T> {
    public success: boolean = true;
    public statusCode: number = StatusCodes.OK;
    public timestamp: number = Date.now();
    public message: string;
    public errors: [] = [];
    public data: T;
    constructor(message = "Success", data: T) {
      this.message = message;
      this.data = data
    }
  }
  
  export default ResponseHelper;