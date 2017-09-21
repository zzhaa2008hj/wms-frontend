import { autoinject } from "aurelia-dependency-injection";
import * as echarts from 'echarts';
import * as moment from 'moment';
import { NoticeService } from '@app/base/services/notice';
import { Notice } from '@app/base/models/notice';
import { DialogService } from 'ui';
import { ReadNotification } from '@app/base/notifications/read';
import { print } from '@app/common/services/print-tool';
import { requiredPermissionsAttributeResult } from '@app/utils';
import { UserSession } from '@app/user';
import { BusinessOrder } from '@app/common/models/business-order';
import { IndexService } from '@app/common/services/index';
import { FeeOrder } from '@app/common/models/fee-order';
import { WarehouseOrder } from '@app/common/models/warehouse-order';
import { Warehouse } from '@app/base/models/warehouse';
import { WarehouseNum } from "@app/report/models/daily-inventory";
import { ChargeAmt, PaymentAmt } from "@app/report/models/daily-payment";

@autoinject
export class Dashboard {

  notices: Notice[];
  notice: Notice = {} as Notice;
  show: boolean = false;
  businessOrder: BusinessOrder;
  feeOrder: FeeOrder;
  warehouseOrder: WarehouseOrder;

  /**
   * 仓库信息概览
   */
  wareChart;
  //显示类别 1 入库 2，出库 ，3，货权转移 ，4 ，货位转移
  wItems: string = "1";
  //显示时间: 默认本周
  wd: string = "1";
  // 柱状还是 折线
  wShow = "bar";
  //显示数据
  warehouseData1 = {} as  WarehouseNum;
  warehouseDataNum;
  warehouseDataQua;
  warehouseCate: any[];
  warehouseItems = [{ value: "1", text: "入库" }, { value: "2", text: "出库" }, { value: "3", text: "货权转移" }, {
    value: "4",
    text: "货位转移"
  }]
  warehouseDates = [{ value: "1", text: "本周" }, { value: "2", text: "本月" }, { value: "3", text: "本季" }, {
    value: "4",
    text: "本年"
  }];

  /**
   * 库存信息概览
   */
  //bar  柱子  pie  饼图
  sc: string = "bar";
  //选中的库
  sw: string ;
  //库存 chart
  stoChart ;
  //库存 数据 从后台获取
  stodatas;
  //柱状图 时间数据
  stoDateInfo ;
  //柱状图数据
  stoData ;
  //饼图 数量数据
  //饼图 件数数据

  storageCategories = [{ value: "bar", text: "柱状图" }, { value: "cake", text: "饼图" }];
  storateWarehouses = [] as Warehouse[];
  warehouse: Warehouse = {} as Warehouse;

  /**
   * 收费信息统计
   */
  //柱子还是折线
  cagShow ='bar';
  //默认显示本周
  cagDate ='1';
  //x 轴时间数据
  cagDateInfo ;
  //显示数据
  cagData;
  //后台传入数据
  cagDatas ={} as ChargeAmt
  //chart
  cagChart;
  chargeDates = [{ value: "1", text: "本周" }, { value: "2", text: "本月" }, { value: "3", text: "本季" }, {
    value: "4",
    text: "本年"
  }];


  /**
   * 付费信息统计
   */
    //柱子还是折线
  payShow ='bar';
  //默认显示本周
  payDate ='1';
  //x 轴时间数据
  payDateInfo ;
  //后台获取数据
  payDatas = {} as PaymentAmt ;
  //显示数据
  payData;
  //chart
  payChart;
  paymentDates = [{ value: "1", text: "本周" }, { value: "2", text: "本月" }, { value: "3", text: "本季" }, {
    value: "4",
    text: "本年"
  }];

  constructor(private dialogService: DialogService,
              private indexService: IndexService,
              private user: UserSession,
              private noticeService: NoticeService) {
    let  a  =[6,7,3,4,5];
    let b =['一','二','三','四','五'];
    let c  = a.map((value ,index)=>({name:b[index],value}));
    console.log(c);
    let d  = c.map((cc)=>(cc.value));
    console.log(d);

  }

  async activate() {
    // todo 公告向上滚动
    this.notices = await this.noticeService.getNotices();
    if (this.notices && this.notices.length > 0) {
      this.show = true;
      this.notice = this.notices[0];
      this.notice.createTimeStr = this.notice.createTime ? moment(this.notice.createTime).format("YYYY-MM-DD") : '';
    }
    //首页 几个数据显示
    this.businessOrder = await this.indexService.getBusinessOrderNumber();
    this.feeOrder = await this.indexService.getFeeOrderNumber();
    this.warehouseOrder = await this.indexService.getWarehouseOrderNumber();
    // 第一张echarts 图 加载数据
    await this.warehouseChange();
    //库存
    await this.getStorageData();

    //  收费
    await this.getChargedata();
    //  付费
    await this.getPayData();

  }


  async detail() {
    await this.dialogService
      .open({ viewModel: ReadNotification, model: { body: this.notice.content, title: this.notice.title }, lock: true })
      .whenClosed();
  }

  // 页面载入完成后执行
  async attached() {
    //初始化
    this.getWorkOrderInfo();

    this.getStorageInfo();
    this.getChargeInfo();
    this.getPayInfo();
  }


  /**
   * 仓库信息
   */
  //初始化数据
  async warehouseChange() {
    this.warehouseData1 = await this.indexService.getWareNum(this.wItems, this.wd);
    this.warehouseDataNum = this.warehouseData1.num;
    this.warehouseDataQua = this.warehouseData1.qua;
    this.warehouseCate = this.warehouseData1.date;
  }

  //初始化echarts
  getWorkOrderInfo() {
    this.wareChart = echarts.init(document.getElementById('main') as HTMLDivElement);
    this.wareChart.on('magictypechanged', (params) => {
      this.wShow = params.currentType;
    });
    this.wareChart.setOption(this.wareOption);
  }

  //时间选择
  async changeWDate(date) {
    this.wd = date;
    await this.warehouseChange();
    this.wareChart.setOption(this.wareOption);
  }

  //仓库信息选择 出库 、入库  、货权转移 、货位转移 切换
  async changeWarehouseitems(value) {
    this.wItems = value;
    await this.warehouseChange();
    this.wareChart.setOption(this.wareOption);
  }

  //仓储信息 option
  get wareOption() {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      toolbox: {
        show: true,
        feature: {
          magicType: { show: true, type: ['line', 'bar'] },
        }
      },
      legend: {
        data: ['件数', '数量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: this.warehouseCate
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [{
        name: '件数',
        type: this.wShow,
        data: this.warehouseDataNum
      }, {
        name: '数量',
        type: this.wShow,
        data: this.warehouseDataQua
      }]
    };

  }

  /**
   *库存信息
   */
  //数据
  async getStorageData(){
    Object.assign(this.warehouse, { id: '', name: '全部' });
    this.storateWarehouses.push(this.warehouse);
    this.storateWarehouses = [...this.storateWarehouses, ...await this.indexService.getTopWarehouses()];
  }

  //初始化图
  async getStorageInfo() {
    this.stoChart = echarts.init(document.getElementById('main2') as HTMLDivElement);
    // 指定图表的配置项和数据

    // 使用刚指定的配置项和数据显示图表。
    this.stoChart.setOption(this.stoOption);
  }
  get optionBar(){

    let  option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        toolbox: {
          show: true,
          feature: {
            myTool2: {
              show: true,
              title: '切换成柱状图',
              icon:'path://M6.7,22.9h10V48h-10V22.9zM24.9,13h10v35h-10V13zM43.2,2h10v46h-10V2zM3.1,58h53.7',
              onclick: ()=>{
                this.sc = "bar";

                this.stoChart.setOption(this.stoOption);
              }
            },
            myTool1: {
              show: true,
              title: '切换成饼图',
              icon:'image://assets/images/chart-icon.png',
              onclick: ()=>{
                this.sc = "pie";

                this.stoChart.setOption(this.stoOption);
              }
            }
          }
        },
        legend: {
          data: ['数量', '件数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          show: true,
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          show: true,
          type: 'category',
          data: ['巴西','印尼','美国','印度','中国','世界人口(万)']
        },
        series: [
          {
            name: '数量',
            type: 'bar',
            data: [18203, 23489, 29034, 104970, 131744, 630230]
          },
          {
            name: '件数',
            type: 'bar',
            data: [19325, 23438, 31000, 121594, 134141, 681807]
          }
        ]
      };

    return option ;

  }
  get optionPie(){
    let option = {
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      xAxis:{
        show: false
      },
      yAxis:{
        show: false
      },
      toolbox: {
        show: true,
        feature: {
          myTool2: {
            show: true,
            title: '切换成柱状图',
            icon:'path://M6.7,22.9h10V48h-10V22.9zM24.9,13h10v35h-10V13zM43.2,2h10v46h-10V2zM3.1,58h53.7',
            onclick: ()=>{
              this.sc = "bar";
              this.stoChart.setOption(this.stoOption);
            }
          },
          myTool1: {
            show: true,
            title: '切换成饼图',
            icon:'image://assets/images/chart-icon.png',
            onclick: ()=>{
              this.sc = "pie";
              this.stoChart.setOption(this.stoOption);
            }
          }
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
      },
      series : [
        {
          name: '访问来源',
          type: 'pie',
          radius : '35%',
          center: ['70%', '60%'],
          data:[
            {value:335, name:'直接访问'},
            {value:310, name:'邮件营销'},
            {value:234, name:'联盟广告'},
            {value:135, name:'视频广告'},
            {value:1548, name:'搜索引擎'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        },{
          name: '访问来源',
          type: 'pie',
          radius : '35%',
          center: ['26%', '60%'],
          data:[
            {value:335, name:'直接访问'},
            {value:310, name:'邮件营销'},
            {value:234, name:'联盟广告'},
            {value:135, name:'视频广告'},
            {value:1548, name:'搜索引擎'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    return option ;

  }
  //
  get stoOption(){
    if(this.sc=="pie"){
      return this.optionPie ;
    }else {
      return this.optionBar ;
    }

  }
  changeSCategory(category) {
    this.sc = category;
  }

  changeSWarehouse(warehouse) {
    this.sw = warehouse;
  }

  /**
   * 收费
   */
  //初始化数据
  async getChargedata() {
    this.cagDatas = await this.indexService.getCagAmt(this.cagDate);
     this.cagDateInfo =this.cagDatas.date ;
     this.cagData =this.cagDatas.amount ;

  }
  //初始化echarts
  getChargeInfo() {
    this.cagChart = echarts.init(document.getElementById('mainCag') as HTMLDivElement);
    this.cagChart.on('magictypechanged', (params) => {
      this.cagShow = params.currentType;
    });
    this.cagChart.setOption(this.cagOption);
  }
  get cagOption(){

    let option = {

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      toolbox: {
        show: true,
        feature: {
          magicType: { show: true, type: ['line', 'bar'] },
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      yAxis: {
        type: 'value',
      },
      xAxis: {
        type: 'category',
        data: this.cagDateInfo
      },
      series: [
        {
          name: '收费',
          type:this.cagShow,
          data: this.cagData
        }
      ]
    };
    return option ;
}
  async changeChargeDate(val) {
    this.cagDate = val ;
    await this.getChargedata();
    this.cagChart.setOption(this.cagOption);

  }

  /**
   * 付费
   */

  //初始化数据
  async getPayData() {
     this.payDatas =await  this.indexService.getPayAmt(this.payDate)
     this.payData = this.payDatas.amount;
     this.payDateInfo =this.payDatas.date ;
  }

  //初始化echarts
  getPayInfo() {
    this.payChart = echarts.init(document.getElementById('mainPay') as HTMLDivElement);
    this.payChart.on('magictypechanged', (params) => {
      this.payShow = params.currentType;
    });
    this.payChart.setOption(this.payOption);
  }
  get payOption(){

    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      toolbox: {
        show: true,
        feature: {
          magicType: { show: true, type: ['line', 'bar'] },
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      yAxis: {
        type: 'value',
      },
      xAxis: {
        type: 'category',
        data: this.payDateInfo
      },
      series: [
        {
          name: '付费',
          type: this.payShow,
          data: this.payData
        }
      ]
    };
    return option ;
  }

  async changePayDate(val) {
    this.payDate = val ;
    await this.getPayData();
    this.payChart.setOption(this.payOption);
  }


  async printOrder() {
    let title = "打印测试";
    let strHTML = '打印测试';
    print(title, strHTML, true);

  }



  requiredPermissions(sourceCode: string) {
    return requiredPermissionsAttributeResult(sourceCode, this.user.userInfo.menuVoList);
  }
}