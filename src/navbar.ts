import { customElement, containerless } from "aurelia-templating";
import { autoinject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { UserSession } from "@app/user";
import { MessageService } from "@app/base/services/message";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import * as moment from 'moment';
import { getWeekDay } from '@app/utils';

@customElement('ui-navbar')
@containerless
@autoinject
export class NavBar {

  unreadNum;
  userName: string;
  dateTime: string;
  weekDay: string;
  subScription: Subscription;

    constructor(private events: EventAggregator,
                private router: Router,
                private messageService: MessageService,
                private user: UserSession) {
        this.unreadNum = this.updateUnreadNum();
        this.userName = this.user.userInfo.employee.name;
        this.dateTime = moment(new Date()).format("YYYY-MM-DD");
        this.weekDay = getWeekDay();

        let w = window as any;
        let lodop = w.CLODOP;
        if (!lodop) {
          let printAddress = this.user.userInfo.printAddress;
          let e = document.createElement("script");
          e.src = printAddress + '/CLodopfuncs.js';
          document.head.appendChild(e);
        }
    }

  toggleSidebar() {
    // this.user.settings.sidebar.condensed = !this.user.settings.sidebar.condensed;
  }

  changePassword() {
    //this.router.navigateToRoute('changePassword');
    window.location.href = `${this.user.changePasswordUrl}?appKey=${this.user.appKey}&appType=${this.user.appType}&returnUrl=${encodeURIComponent(window.location.href)}`;
  }

  showInfo() {
    this.router.navigateToRoute('notifications');
  }

    async updateUnreadNum() {

        let num = parseInt(await this.messageService.getUnreadNum());
        if (num <= 99) {
            this.unreadNum = num;
        }
        else {
            this.unreadNum = `99+`;
        }
    }


    bind() {
        this.subScription = this.events.subscribe('event-source:message', () => {
            this.updateUnreadNum();
        });
        this.subScription = this.events.subscribe('event-source:read', () => {
            this.updateUnreadNum();
        });
    }

  unbind() {
    this.subScription.dispose();
  }

  logout() {
    this.user.logout();
  }

}