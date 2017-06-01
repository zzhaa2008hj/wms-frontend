import { autoinject } from "aurelia-framework";
import { DialogService } from "aurelia-dialog";
import { AlertOptions, Alert } from "../components/dialog/alert";
import { Confirm, ConfirmOptions } from "../components/dialog/confirm";
import { Prompt, PromptOptions } from "../components/dialog/prompt";

/**
 * @author 祁志海
 */
@autoinject
export class MessageDialogService {

  constructor(private dialogService: DialogService) {}

  async alert(options: AlertOptions): Promise<void> {
    await this.dialogService.open({ viewModel: Alert, model: options })
      .whenClosed();
  }

  async prompt(options: PromptOptions): Promise<string | null> {
    let result = await this.dialogService.open({ viewModel: Prompt, model: options })
      .whenClosed();
    return result.wasCancelled ? null : result.output as string;
  }

  async confirm(options: ConfirmOptions): Promise<boolean> {
    let result = await this.dialogService.open({ viewModel: Confirm, model: options })
      .whenClosed();
    return !result.wasCancelled;
  }

}