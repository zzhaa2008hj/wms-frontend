/**
 * 
 */

import { HttpClient, HttpResponseMessage, RequestBuilder } from "aurelia-http-client";
import { autoinject } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";


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
export function dateConverter<T>(...keys: string[]): (obj: T) => T  {
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

export function extractResult({code = null, message, content}: { code: number, message: string, content: any }): any {
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

  readAll? : (params: any) => any[] | Promise<any[]>;
  query?: (params: any) => Query<any>;
  // serverPaging?: boolean;
  pageSize?: number;
  error?: (error: Error) => void;

}

@autoinject
export class DataSourceFactory {

  constructor(private events: EventAggregator) {}

  create({readAll, query, pageSize, error: onError}: DataSourceOptions2) {
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

    return new kendo.data.DataSource({
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
    });
  }

}

/**
 * 
 * @deprecated
 * @see DataSourceFactory
 */
export function createDataSource({read, serverPaging, pageSize, error}: DataSourceOptions) {

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