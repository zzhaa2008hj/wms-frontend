export class ConstantValues {

  static get BusinessTypes() {
    return ["入库", "出库", "货权转移", "货位转移", "货物质押", "合同"];
  }

  static get ContractStage() {
    return ["撤回中", "已撤回", "待审核", "未通过审核", "审核通过", "生效中"];
  }

  static get InstockStages() {
    return ["撤回中", "已撤回", "待商务审核", "商务审核未通过", "商务审核通过", "已生成入库指令单", "入库作业中",
      "作业完成（待审核）", "库场审核未通过", "库场审核通过", "已生成理货报告", "已生成入库单", "入库完成"];
  }

  static get ChargeCategory() {
    return [{ text: "仓储费", value: 1 }, { text: "装卸费", value: 2 }, { text: "其他费用", value: 3 }];
  }

  static get CustomerCategory() {
    return [{ text: "仓储客户", value: 1 }, { text: "装卸单位", value: 2 }];
  }

  static get ChargeType() {
    return [{ text: "收费业务", value: 1 }, { text: "付费业务", value: 2 }];
  }

  static get PricingMode() {
    return [{ text: "单一计费", value: 1 }, { text: "阶梯计费", value: 2 }];
  }

  static get ContractTypes() {
    return [{ "name": "客户仓储", "type": 1 }, { "name": "装卸单位", "type": 2 }, { "name": "库区租赁", "type": 3 }];
  }
}