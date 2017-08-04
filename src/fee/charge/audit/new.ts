import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { ChargeAuditItemService, ChargeAuditListService } from "@app/fee/services/charge-audit";
import { OrganizationService } from "@app/base/services/organization";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { Organization } from "@app/base/models/organization";
import * as moment from 'moment';

@autoinject
export class Audit {
  chargeInfo: ChargeInfo;
  chargeAuditLists: ChargeAuditList[];
  organization: Organization;

  constructor(private dialogController: DialogController,
              private chargeAuditListService: ChargeAuditListService,
              private chargeAuditItemService: ChargeAuditItemService,
              private organizationService: OrganizationService) {
  }

  async activate(chargeInfo: ChargeInfo) {
    this.chargeInfo = chargeInfo;
    this.chargeAuditLists = await this.chargeAuditListService.getListByChargeInfoId(chargeInfo.id);
    this.organization = await this.organizationService.getOrganization(this.chargeInfo.orgId);

    this.chargeInfo.chargeStartDateStr = moment(this.chargeInfo.chargeStartDate).format("YYYY-MM-DD");
    this.chargeInfo.chargeEndDateStr = moment(this.chargeInfo.chargeEndDate).format("YYYY-MM-DD");

  }

  async auditSecondFee(status: number) {
    await this.dialogController.ok(status);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

  detailInit(e) {
    let detailRow = e.detailRow;

    detailRow.find('.tabstrip').kendoTabStrip({
      animation: {
        open: { effects: 'fadeIn' }
      }
    });

    detailRow.find('.orders').kendoGrid({
      dataSource: {
        transport: {
          read: async options => {
            await this.chargeAuditItemService.getListByChargeAuditId(e.data.id)
              .then(options.success)
              .catch(err => options.errot("", "", err));
          }
        }
      },
      scrollable: false,
      sortable: true,
      columns: [
        { field: 'chargeType', title: '收付费' },
        { field: 'chargeCategory', title: '费用类别' },
        { field: 'cargoName', title: '货名' },
        { field: 'cargoCategoryName', title: '货类' },
        { field: 'cargoSubCategoryName', title: '品牌' },
        { field: 'warehouseName', title: '库区名称' },
        { field: 'quantity', title: '重量' },
        { field: 'number', title: '件数' },
        { field: 'unit', title: '计量单位' },
        { field: 'startDate', title: '开始日期' },
        { field: 'endDate', title: '结束日期' },
        { field: 'containerType', title: '箱型' },
        { field: 'containerQuantity', title: '箱量' },
        { field: 'storageDay', title: '堆存天数' },
        { field: 'storageRate', title: '堆存费率' },
        { field: 'remark', title: '备注' },
      ]
    });
  }

  onDataBound(e) {
    let grid = e.sender;
    grid.expandRow(grid.tbody.find('tr.k-master-row').first());
  }

}