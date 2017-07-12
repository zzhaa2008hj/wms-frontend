export class ConstantValues {

  static get BusinessTypes() {
    return [{
      type: 1,
      name: "入库"
    }, {
      type: 2,
      name: "出库"
    }, {
      type: 3,
      name: "货权转移"
    }, {
      type: 4,
      name: "货位转移"
    }, {
      type: 5,
      name: "货物质押"
    }, {
      type: 6,
      name: "合同"
    }];
  }

  static get ContractStage() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "已撤回"
    }, {
      stage: 1,
      title: "待审核"
    }, {
      stage: 2,
      title: "未通过审核"
    }, {
      stage: 3,
      title: "审核通过"
    }, {
      stage: 4,
      title: "生效中"
    }, {
      stage: 5,
      title: "已过期"
    }];
  }

  static get InstockStages() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "已撤回"
    }, {
      stage: 1,
      title: "待商务审核"
    }, {
      stage: 2,
      title: "商务审核未通过"
    }, {
      stage: 3,
      title: "商务审核通过"
    }, {
      stage: 4,
      title: "已生成入库指令单"
    }, {
      stage: 5,
      title: "入库作业中"
    }, {
      stage: 6,
      title: "作业完成（待审核）"
    }, {
      stage: 7,
      title: "库场审核未通过"
    }, {
      stage: 8,
      title: "库场审核通过"
    }, {
      stage: 9,
      title: "已生成理货报告"
    }, {
      stage: 10,
      title: "已生成入库单"
    }, {
      stage: 11,
      title: "入库完成"
    }];
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

  static get WorkInfoCategory() {
    return [{ text: "入库", value: 1 }, { text: "出库", value: 2 }, { text: "移库", value: 4 }];
  }
}