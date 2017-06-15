/**
 * Created by Hui on 2017/6/15.
 */
export function group(items: any[], key: string, parentKey: string, childrenKey: string) {
  let map = new Map(items.map<[any, any]>(item => [item[key], item]));
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
}

export function treeHelper<T>(items: T[],
                              { key = 'id',
                                parentKey = 'parentId',
                                childrenKey = 'children' }: TreeOptions): TreeHelper<T> {
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
export interface TreeOptions {
  key?: string;
  parentKey?: string;
  childrenKey?: string;
}

export interface TreeHelper<T> {
  toTree(): T[];
  pathFor(item: T): T[];
}