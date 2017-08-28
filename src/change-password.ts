import { autoinject, newInstance } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { UserSession } from "@app/user";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";
@autoinject
export class ChangePassword {

    changePassword: ChangePassword;
    disabled = false;
    private backUrl = true;

    constructor(private user: UserSession, private router: Router,
        private messageDialogService: MessageDialogService,
        @newInstance() private validationController: ValidationController) {
        validationController.addRenderer(formValidationRenderer);
        this.validationController.addObject(this.changePassword, validationRules);
        let history = this.router.history as any;
        if (!history.previousLocation) {
            this.backUrl = false;
        }
    }


    async doSave() {
        this.validationController.addObject(this.changePassword, validationRules)
        if (this.changePassword.newPassword != this.changePassword.confirmPassword) {
            await this.messageDialogService.alert({ title: "", message: "新密码和确认密码不同，请重新输入！", icon: "error" });
        } else {
            let originalPwd = window['md5'](this.changePassword.originalPassword).toUpperCase();
            let newPwd = window['md5'](this.changePassword.newPassword).toUpperCase();
            try {
                this.disabled = true;
                await this.user.changePassword(originalPwd, newPwd);
                await this.messageDialogService.alert({ title: "", message: "编辑成功！" });
                this.goBack();
            } catch (err) {
                this.disabled = false;
                await this.messageDialogService.alert({ title: "", message: err.message, icon: "error" });
            }
        }
    }

    goBack() {
        if (this.backUrl) {
            this.router.navigateBack();
        } else {
            this.router.navigateToRoute('rpc');
        }
    }

}

export interface ChangePassword{
    originalPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const validationRules = ValidationRules
    .ensure((e: ChangePassword) => e.originalPassword)
    .displayName('原密码')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(20).withMessage(`\${$displayName} 长度不能超过20`)

    .ensure((e: ChangePassword) => e.newPassword)
    .displayName('新密码')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(20).withMessage(`\${$displayName} 长度不能超过20`)

    .ensure((e: ChangePassword) => e.confirmPassword)
    .displayName('确认密码')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(20).withMessage(`\${$displayName} 长度不能超过20`)
    .rules;