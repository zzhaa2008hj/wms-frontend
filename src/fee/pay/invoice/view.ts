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
}
