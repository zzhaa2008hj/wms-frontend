import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";

@autoinject
export  class ReadNotification{

    title : string;
    body: string;
    constructor(){

    }
    activate({body: body ,title: title}){
        this.body = body ;
        this.title = title ;
    }


}