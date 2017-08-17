import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { ChargeAuditItemService, ChargeAuditListService } from "@app/fee/services/charge-audit";
import { OrganizationService } from "@app/base/services/organization";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { Organization } from "@app/base/models/organization";
import * as moment from 'moment';
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class Audit {
  chargeInfo = {} as ChargeInfo;
  chargeAuditLists: ChargeAuditList[];
  organization: Organization;

  units: DictionaryData[];
  containerTypes: DictionaryData[];
  constructor(private dialogController: DialogController,
              private chargeAuditListService: ChargeAuditListService,
              private chargeAuditItemService: ChargeAuditItemService,
              private organizationService: OrganizationService,
              private dictionaryDataService: DictionaryDataService) {
  }

  async activate(chargeInfo: ChargeInfo) {
    this.chargeInfo = Object.assign(this.chargeInfo, chargeInfo);
    this.chargeAuditLists = await this.chargeAuditListService.getListByChargeInfoId(this.chargeInfo.id);
    this.organization = await this.organizationService.getOrganization(this.chargeInfo.orgId);

    this.chargeInfo.chargeStartDateStr = moment(this.chargeInfo.chargeStartDate).format("YYYY-MM-DD");
    this.chargeInfo.chargeEndDateStr = this.chargeInfo.chargeEndDate ? moment(this.chargeInfo.chargeEndDate).format("YYYY-MM-DD"): '';

    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.containerTypes = await this.dictionaryDataService.getDictionaryDatas("containerType");
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
            try {
              let items = await this.chargeAuditItemService.getListByChargeAuditId(e.data.id);
              items.map(item => {
                let unit = this.units.find(r => r.dictDataCode == item.unit);
                if (unit) {
                  item.unitStr = unit.dictDataName;
                }
                let containerType = this.containerTypes.find(r => r.dictDataCode == item.containerType);
                if (containerType) {
                  item.containerTypeStr = containerType.dictDataName;
                }
                if (item.startDate) {
                  item.startDate = new Date(item.startDate);
                }
                if (item.endDate) {
                  item.endDate = new Date(item.endDate);
                }
                let rateType = ConstantValues.WorkInfoCategory.find(r => r.value == item.rateType);
                if (rateType) {
                  item.rateTypeName = rateType.text;
                }
                let chargeCategory = ConstantValues.ChargeCategory.find(r => r.value == item.chargeCategory);
                if (chargeCategory) {
                  item.chargeCategoryName = chargeCategory.text;
                }
                return item;
              });
              options.success(items);
            }catch (err) {
              options.error("", "", err);
            }
          }
        }
      },
      scrollable: false,
      sortable: true,
      columns: [
        { field: 'rateTypeName', title: '收付费' },
        { field: 'chargeCategoryName', title: '费用类别' },
        { field: 'cargoName', title: '货名' },
        { field: 'cargoCategoryName', title: '货类' },
        { field: 'cargoSubCategoryName', title: '品牌' },
        { field: 'warehouseName', title: '库区名称' },
        { field: 'quantity', title: '重量' },
        { field: 'number', title: '件数' },
        { field: 'unitStr', title: '计量单位' },
        { field: 'startDate', title: '开始日期', format: '{0:yyyy-MM-dd}'},
        { field: 'endDate', title: '结束日期', format: '{0:yyyy-MM-dd}'},
        { field: 'containerTypeStr', title: '箱型' },
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