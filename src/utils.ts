/**
 * 
 */

import { HttpClient, HttpResponseMessage, RequestBuilder } from "aurelia-http-client";
import { autoinject } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";
import { v4 } from 'uuid';
import { MenuAndModule } from '@app/user';
import { DialogService, MessageDialogService } from "ui";
import * as moment from 'moment';
import * as jsPDF from "jspdf";
import * as html2canvas from "html2canvas";

export function copy<T extends Object>(obj: T): T {
  return Object.assign({}, obj);
}

export interface QueryOptions {
  skip?: number;
  take?: number;
}

export interface Query<T> {
  map<X>(f: (data: T) => X): Query<X>;

  fetch(options?: QueryOptions): Promise<QueryResult<T>>;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
}

/**
 * <pre>
 * let obj = { a: 1, b: 'b', c: false };
 * pick(obj, 'a', 'c'); // => { a: 1, c: false }
 * </pre>
 * @param obj 
 * @param keys 
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  let data: any = {};
  keys.forEach(key => {
    data[key] = obj[key];
  });
  return data;
}

/**
 * 修正对象的字段值
 * 有些对象字段类型为Date，但是json数据传过来是string或者number，需要处理下
 * @param obj 
 * @param keys 
 * @param fix 
 */
export function fix<K extends string, U, T extends Record<K, U>>(obj: T, keys: K[], fix: (v: any) => U): T {
  keys.forEach(key => {
    if (obj[key]) obj[key] = fix(obj[key]);
  });
  return obj;
}

/**
 * 修正数据对象的Date类型字段 （原先字段实际为number类型）
 * @param obj 
 * @param keys 
 */
export function fixDate<K extends string, T extends Record<K, Date>>(obj: T, ...keys: K[]): T {
  return fix(obj, keys, v => new Date(v));
}


/**
 * 用于区分普通的HttpClient
 */
export abstract class RestClient extends HttpClient {

  query<T>(url: string, params?: { [name: string]: any }, headers?: { [name: string]: string }): Query<T> {
    return new QueryImpl(this.createRequest(url), params, headers);
  }

}


/**
 * 返回转换日期字段的函数
 * @param keys 需要转换成Date类型的字段
 * @deprecated
 * @see fixDate
 */
export function dateConverter<T>(...keys: string[]): (obj: T) => T {
  return obj => {
    keys.forEach(key => {
      let value = obj[key];
      if (value != null) obj[key] = new Date(value);
    });
    return obj;
  };
}

export function handleResult(res: HttpResponseMessage): void {
  if (res.statusCode == 200) return extractResult(res.content);
  throw new Error(`HTTP请求错误[${res.statusCode}] ${res.content}`);
}

export function extractResult({ code = null, message, content }: { code: number, message: string, content: any }): any {
  if (code == null) throw new Error("无code字段");
  if (code == 100) return content;
  let reason: string;
  if (code == 999) {
    reason = message || "未知错误";
  } else if (code == -1001) {
    reason = "用户名或密码错误";
  } else if (code == -1002) {
    reason = "用户不存在";
  } else if (code == -1003) {
    reason = "用户未登录";
  }
  throw new Error(reason);
}

export interface DataSourceOptions {
  read?: (params: any) => Query<any>;
  serverPaging?: boolean;
  pageSize?: number;
  error?: (error: Error) => void;
}

export interface DataSourceOptions2 {

  readAll?: (params: any) => any[] | Promise<any[]>;
  query?: (params: any) => Query<any>;
  // serverPaging?: boolean;
  pageSize?: number;
  error?: (error: Error) => void;

}

@autoinject
export class DataSourceFactory {

  constructor(private events: EventAggregator) { }

  create({ readAll, query, pageSize, error: onError }: DataSourceOptions2) {
    let serverPaging: boolean;
    let read: (options: any) => void;
    let schema: any;
    if (query) {
      serverPaging = true;
      schema = {
        total: 'total',
        data: 'data'
      };
      read = options => {
        query(options.data).fetch(options.data)
          .then(options.success)
          .catch(err => options.error('', '', err));
      };
    } else if (readAll) {
      serverPaging = false;
      schema = null;
      read = options => {
        Promise.resolve(readAll(options.data))
          .then(options.success)
          .catch(err => options.error('', '', err));
      };
    }
    let options: any = {
      transport: {
        read
      },
      error: (e) => {
        if (onError) {
          onError(e.errorThrown);
        } else {
          this.events.publish('error', e.errorThrown);
        }
      },
      schema,
      serverPaging,
      pageSize
    };
    if (!options.schema) delete options.schema;
    return new kendo.data.DataSource(options);
  }

}

/**
 * 
 * @deprecated
 * @see DataSourceFactory
 */
export function createDataSource({ read, serverPaging, pageSize, error }: DataSourceOptions) {

  return new kendo.data.DataSource({
    transport: {
      read: async options => {
        await read(options.data).fetch(options.data)
          .then(options.success, err => options.error('', '', err));
      }
    },
    error: (e) => {
      if (error) {
        error(e.errorThrown);
      } else {
        //TODO 用notifications控件通知错误信息
      }
    },
    schema: {
      total: 'total',
      data: 'data'
    },
    serverPaging,
    pageSize
  });

}

export function md5(s: string): string {
  return window['md5'](s);
}

export function uuid(): string {
  return replaceAll(v4(), "-", "");
}

export function replaceAll(s: string, sv: string, rv: string): string {
  s = s.replace(sv, rv);
  if (s.includes(sv)) {
    s = replaceAll(s, sv, rv);
  }
  return s;
}

export function getWeekDay(date?: Date) {
  let weekDay = "";
  if (date) {
    weekDay = moment(date).format('dddd');
  } else {
    weekDay = moment(new Date()).format('dddd');
  }
  switch (weekDay) {
    case 'Monday': weekDay = '星期一';
      break;
    case 'Tuesday': weekDay = '星期二';
      break;
    case 'Wednesday': weekDay = '星期三';
      break;
    case 'Thursday': weekDay = '星期四';
      break;
    case 'Friday': weekDay = '星期五';
      break;
    case 'Saturday': weekDay = '星期六';
      break;
    case 'Sunday': weekDay = '星期日';
      break;
    default:
      break;
  }
  return weekDay;
}

export interface TreeOptions {
  key?: string;
  parentKey?: string;
  childrenKey?: string;
}

export function treeHelper<T>(items: T[],
  { key = 'id', parentKey = 'parentId', childrenKey = 'children' }: TreeOptions): TreeHelper<T> {
  let map = new Map(items.map<[any, T]>(item => [item[key], item]));
  return {
    toTree() {
      let rootItems = [];
      for (let item of items) {
        let parentId = item[parentKey];
        if (parentId) {
          let parentItem = map.get(parentId);
          if (!parentItem) throw new Error(`#${parentId}不存在`);
          let s = parentItem[childrenKey];
          if (!s) {
            parentItem[childrenKey] = [item];
          } else {
            s.push(item);
          }
        } else {
          rootItems.push(item);
        }
      }
      return rootItems;
    },
    pathFor: function pathFor(item: T) {
      let basePath: T[];
      let parentId = item[parentKey];
      if (parentId) {
        let parent = map.get(parentId);
        if (!parent) throw new Error(`#${parentId}不存在`);
        basePath = pathFor(parent);
      } else {
        basePath = [];
      }
      return basePath.concat(item);
    }
  };
}

export interface TreeHelper<T> {
  toTree(): T[];
  pathFor(item: T): T[];
}


class QueryImpl<T> implements Query<T> {

  constructor(private request: RequestBuilder,
    private params?: { [name: string]: any },
    private headers?: { [name: string]: any },
    private mapper?: Function) {
    if (headers) {
      for (let key of Object.keys(headers)) {
        this.request = this.request.withHeader(key, headers[key]);
      }
    }
  }

  map<X>(f: (data: T) => X): Query<X> {
    let fn = this.mapper ? data => f(this.mapper.call(null, data)) : f;
    return new QueryImpl(this.request, this.params, this.headers, fn);
  }

  async fetch(options?: QueryOptions) {
    let { skip = 0, take } = options;
    let req = this.request;
    let params;
    if (take) {
      let page = (skip / take) + 1;
      let pageSize = options.take;
      params = { page, pageSize };
      if (this.params) {
        Object.assign(params, this.params);
      }
      req = req.withParams(params);
    } else if (this.params) {
      params = this.params;
      req = req.withParams(params);
    }
    return req.asGet().send()
      .then(res => {
        let data = res.content.data;
        if (this.mapper) data = data.map(this.mapper);
        return {
          total: res.content.total as number,
          data: data as T[]
        };
      });
  }

}

/**
 * 判断用户有没有sourceCode的权限 true：有  flase: 没有
 * @param sourceCode 
 * @param menuVoList 
 */
export function requiredPermissionsAttributeResult(sourceCode: string, menuVoList: MenuAndModule[]): boolean {
  let aa = new Set(menuVoList.map(x => x.code));
  return aa.has(sourceCode);
}

export function alertError(dialogService: DialogService | MessageDialogService, message: any): void {
  dialogService.alert({ title: "发生错误", message: message, icon: 'error' });
}

/**
 * 人民币大小写转化
 */
export function convertCurrency(currencyDigits) {
  // Constants:
  let MAXIMUM_NUMBER = 99999999999.99;
  // Predefine the radix characters and currency symbols for output:
  let CN_ZERO = "零";
  let CN_ONE = "壹";
  let CN_TWO = "贰";
  let CN_THREE = "叁";
  let CN_FOUR = "肆";
  let CN_FIVE = "伍";
  let CN_SIX = "陆";
  let CN_SEVEN = "柒";
  let CN_EIGHT = "捌";
  let CN_NINE = "玖";
  let CN_TEN = "拾";
  let CN_HUNDRED = "佰";
  let CN_THOUSAND = "仟";
  let CN_TEN_THOUSAND = "万";
  let CN_HUNDRED_MILLION = "亿";
  // let CN_SYMBOL = "（RMB）";
  let CN_DOLLAR = "元";
  let CN_TEN_CENT = "角";
  let CN_CENT = "分";
  let CN_INTEGER = "整";

  // letiables:
  let integral; // Represent integral part of digit number.
  let decimal; // Represent decimal part of digit number.
  let outputCharacters; // The output result.
  let parts;
  let digits, radices, bigRadices, decimals;
  let zeroCount;
  let i, p, d;
  let quotient, modulus;

  // Validate input string:
  currencyDigits = currencyDigits.toString();
  if (currencyDigits == "") {
    alert("Empty input!");
    return "";
  }
  if (currencyDigits.match(/[^,.\d]/) != null) {
    alert("Invalid characters in the input string!");
    return "";
  }
  if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
    alert("Illegal format of digit number!");
    return "";
  }

  // Normalize the format of input digits:
  currencyDigits = currencyDigits.replace(/,/g, ""); // Remove comma delimiters.
  currencyDigits = currencyDigits.replace(/^0+/, ""); // Trim zeros at the beginning.
  // Assert the number is not greater than the maximum number.
  if (Number(currencyDigits) > MAXIMUM_NUMBER) {
    alert("Too large a number to convert!");
    return "";
  }

  // Process the coversion from currency digits to characters:
  // Separate integral and decimal parts before processing coversion:
  parts = currencyDigits.split(".");
  if (parts.length > 1) {
    integral = parts[0];
    decimal = parts[1];
    // Cut down redundant decimal digits that are after the second.
    decimal = decimal.substr(0, 2);
  }
  else {
    integral = parts[0];
    decimal = "";
  }
  // Prepare the characters corresponding to the digits:
  digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
  radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
  bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
  decimals = new Array(CN_TEN_CENT, CN_CENT);
  // Start processing:
  outputCharacters = "";
  // Process integral part if it is larger than 0:
  if (Number(integral) > 0) {
    zeroCount = 0;
    for (i = 0; i < integral.length; i++) {
      p = integral.length - i - 1;
      d = integral.substr(i, 1);
      quotient = p / 4;
      modulus = p % 4;
      if (d == "0") {
        zeroCount++;
      }
      else {
        if (zeroCount > 0) {
          outputCharacters += digits[0];
        }
        zeroCount = 0;
        outputCharacters += digits[Number(d)] + radices[modulus];
      }
      if (modulus == 0 && zeroCount < 4) {
        outputCharacters += bigRadices[quotient];
      }
    }
    outputCharacters += CN_DOLLAR;
  }
  // Process decimal part if there is:
  if (decimal != "") {
    for (i = 0; i < decimal.length; i++) {
      d = decimal.substr(i, 1);
      if (d != "0") {
        outputCharacters += digits[Number(d)] + decimals[i];
      }
    }
  }
  // Confirm and return the final output string:
  if (outputCharacters == "") {
    outputCharacters = CN_ZERO + CN_DOLLAR;
  }
  if (decimal == "") {
    outputCharacters += CN_INTEGER;
  }
  // outputCharacters = CN_SYMBOL + outputCharacters;
  return outputCharacters;
}
/**
 * 两个浮点数相乘
 */
export function accMul(num1, num2): number {
  if (num1 == null || num1 == undefined || isNaN(num1) || num2 == null || num2 == undefined || isNaN(num2)) {
    return NaN;
  }
  let m = 0, s1 = num1.toString(), s2 = num2.toString();
  try { m += s1.split(".")[1].length; } catch (e) { }
  try { m += s2.split(".")[1].length; } catch (e) { }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
} 

/**
 * 两个浮点数相减  
 */
export function accSub(num1, num2): number {
  if (num1 == null || num1 == undefined || isNaN(num1) || num2 == null || num2 == undefined || isNaN(num2)) {
    return NaN;
  }
  let r1, r2, m, n;
  try {
    r1 = num1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = num2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  n = (r1 >= r2) ? r1 : r2;
  return parseFloat((Math.round(num1 * m - num2 * m) / m).toFixed(n));
} 

/**
 * 两个浮点数相加  
 */
export function accAdd(num1, num2) {
  if (num1 == null || num1 == undefined || isNaN(num1) || num2 == null || num2 == undefined || isNaN(num2)) {
    return NaN;
  }
  let r1, r2, m;
  try {
    r1 = num1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = num2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  return Math.round(num1 * m + num2 * m) / m;  
}
/**
 * html to pdf 
 * html2canvas & jspdf
 */
export function exportPDF(id: string, name: string) {
  let html = document.getElementById(id);
  html.style.backgroundColor = 'white';
  html2canvas(html, {
    onrendered: (canvas) => {
      //返回图片dataURL，参数：图片格式和清晰度(0-1)
      let pageData = canvas.toDataURL('image/jpeg', 1.0);
      
      //方向默认竖直，尺寸ponits，格式a4[595.28,841.89]
      let pdf = new jsPDF('', 'pt', 'a4');

      //addImage后两个参数控制添加图片的尺寸，此处将页面高度按照a4纸宽高比列进行压缩
      pdf.addImage(pageData, 'JPEG', 0, 0, 595.28, 592.28 / canvas.width * canvas.height );
      pdf.save(name + '.pdf');
    }
  });
}  