import { autoinject } from "aurelia-dependency-injection";
import { bindable, customElement } from "aurelia-templating";
import { observable } from "aurelia-framework";

@customElement('work-area')
export class NewWorArea {

  
  @bindable
  instockCargoId= "11" ;

  constructor(){
      alert(this.instockCargoId);
  }

  instockCargoIdChanged(){
      alert("22");
  }

  
}
