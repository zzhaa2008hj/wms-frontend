import { EventAggregator } from "aurelia-event-aggregator";
import { RestClient, handleResult } from "@app/utils";
import { autoinject } from "aurelia-framework";

const USER_TOKEN = 'user-token';

@autoinject
export class UserSession {

    loggedIn = false;

    token = '';
    loginUrl = '';
    appKey = '';
    appType = '';

    userInfo: UserInfo;

    constructor(private http: RestClient,
                private events: EventAggregator) {
        this.token = sessionStorage.getItem(USER_TOKEN);
        if (!this.token) this.token = localStorage.getItem(USER_TOKEN);
        this.http.configure(b => {
            if (this.token) b.withHeader("x-eupwood-session-token", this.token);
        });
        if (this.token) this.loggedIn = true;
    }

    /**
     * 验证是否登录  （没有验证token是否有效）
     */
    async loginVerdict() {
        if (!this.loggedIn) {
            //未登录判断url中是否带有token参数
            //没有token ==> 跳转到登录界面
            //有token 把token参数放入session中 ，去掉token参数，重定向页面
            let param = this.getRequest();
            let url = this.loginUrl + "?appKey=" + this.appKey + "&appType=" + this.appType + "&returnUrl=" 
              + encodeURIComponent(window.location.href);
            if (param["token"]) {
                sessionStorage.setItem(USER_TOKEN, param['token']);
                url = window.location.href.split('?')[0];
            }
            window.location.href = url;
        } else {
            let res = await this.http.get('/rest/account/getAccountByToken');
            this.userInfo = res.content;
            this.events.publish("user:authenticate", this.userInfo);
        }
    }

    /**
     * 获取用户信息
     */
    async getUserInfo() {
        let res = await this.http.get('/rest/account/getAccountByToken');
        this.userInfo = res.content;
        this.events.publish("user:authenticate", this.userInfo);
        return res.content;
    }

    getRequest() {
        let url = window.location.href; //获取url中"?"符后的字串
        let theRequest = new Object();
        if (url.indexOf("?") != -1) {
            //let str = url.substr(1);
            let str = url.split("?")[1];
            let strs = str.split("&");
            strs.forEach(x => theRequest[x.split("=")[0]] = (x.split("=")[1]))
        }
        return theRequest;
    }

    logout() {
        this.loggedIn = false;
        this.token = '';
        localStorage.removeItem(USER_TOKEN);
        sessionStorage.removeItem(USER_TOKEN);
        this.events.publish('user:logout');
    }

    async changePassword(originalPassword: string, newPassword: string): Promise<void> {
        let url = `/rest/account//change-password/?originalPassword=${originalPassword}&newPassword=${newPassword}`;
        await this.http.put(url, {}).then(handleResult);
    }
}

export class UserInfo {
    userId: string;
    userName: string;
    token: string;
    appKey: string;
    appType: number;
    organizationId: string;
    employeeId: string;
    appId: string;
    menuVoList: MenuAndModule[];
}

export class MenuAndModule {
    id: string;
    name: string;
    code: string;
    url: string;
    menuType: number;
    linkType: number;
    appId: string;
    appKey: string;
    appType: number;
}