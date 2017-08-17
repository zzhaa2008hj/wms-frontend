import { autoinject } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class Dashboard {
    constructor(private events: EventAggregator){
    }
  publish(){
      this.events.publish('user:authenticate',{orgId:"6bef5d9d82b44e80833884619b3d1cb2",userId :"83731b46959547f8a1b5109966044c7f"});
  }
}