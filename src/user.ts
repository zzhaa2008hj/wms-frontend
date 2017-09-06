import { EventAggregator } from "aurelia-event-aggregator";
import { RestClient, handleResult } from "@app/utils";
import { autoinject } from "aurelia-framework";

const USER_TOKEN = 'user-token';

@autoinject
export class UserSession {

    loggedIn = false;

    token = '';
    loginUrl = '';
    loginOutUrl = '';
    changePasswordUrl = '';
    appKey = '';
    appType = '';

    userInfo: UserInfo;

    constructor(private http: RestClient,
        private events: EventAggregator) {
        this.token = this.getCookie(USER_TOKEN);
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
            this.login();
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



    getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return decodeURI(arr[2]);
        else
            return null;
    }

    delCookie(name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = this.getCookie(name);
        if (cval != null)
            document.cookie = name + "=" + cval + ";expires=" + exp.toUTCString();
    }

    async logout() {
        let token = encodeURIComponent(this.token);
        await this.http.delete(`${this.loginOutUrl}?token=${token}`);
        this.loggedIn = false;
        this.token = '';
        this.delCookie(USER_TOKEN)
        this.events.publish('user:logout');
    }
    async login(){
        let url = `${this.loginUrl}?appKey=${this.appKey}&appType=${this.appType}&returnUrl=${encodeURIComponent(window.location.href)}`;
        window.location.href = url;
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
    printAddress: string;
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