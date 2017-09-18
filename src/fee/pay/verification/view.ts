import { inject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { VerificationService } from "@app/fee/services/verification";

export class VerificationView {
  dataSource: kendo.data.DataSource;
  constructor(@inject private verificationService: VerificationService,
              @inject private dialogService: DialogService) {
  }

  async activate({invoiceId}) {
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: async (options) => {
          options.success(await this.verificationService.getVerifications(invoiceId));
        }
      }
    });
  }

  async delete(id) {
    try {
      let confirm = await this.dialogService.confirm({ title: "提示", message: "删除后无法恢复，确定要删除？" });
      if (confirm) {
        await this.verificationService.deleteVerification(id);
        await this.dialogService.alert({ title: "提示", message: "新增成功！" });
        this.dataSource.read();
      }
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
    }
  }
}
