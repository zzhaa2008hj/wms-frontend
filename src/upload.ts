
export interface Upload {
  readonly progress: UploadProgress;
  readonly result: Promise<UploadResult>;
  abort(): void;
}

export interface UploadOptions {
  baseUrl?: string;
  path?: string;
  method?: 'POST' | 'PUT';
  responseType?: 'json' | 'text';
}

export interface UploadResult {
  canceled: boolean;
  status?: 'success' | 'failure';
  data?: any;
  error?: any;
}

export interface UploadProgress {
  loaded: number;
  total?: number;
}

export class Uploader {

  constructor(private options: UploadOptions = {}) {
    
  }

  upload(file: File, options?: UploadOptions): Upload {
    if (options) {
      options = Object.assign({}, this.options, options);
    } else {
      options = this.options;
    }
    let { method = 'POST', responseType = 'json', baseUrl = "", path = "" } = options;
    console.log(`${baseUrl}${path}`)
    let aborting = false;
    let resolve: Function;
    let reject: Function;
    let result = new Promise<UploadResult>((resolve1, reject1) => {
      [resolve, reject] = [resolve1, reject1];
    });
    let progress = {
      loaded: 0,
      total: 0
    };
    let req = new XMLHttpRequest();
    req.responseType = responseType;
    if (path && !path.startsWith('/')) path = '/' + path;
    req.open(method, `${baseUrl}${path}`);

    req.upload.onprogress = e => {
      if (e.lengthComputable) progress.total = e.total;
      progress.loaded = e.loaded;
      console.info('upload.onprogress', e);
    };

    // function parseResponse(req: XMLHttpRequest) {
    //   if (!req.responseType) return null;
    //   let data;
    //   if (req.responseType == 'text') {
    //     data = req.responseText;
    //   } else {
    //     data = req.response;
    //   }
    //   return data;
    // }

    req.onreadystatechange = () => {
      console.log('readyState', req.readyState, req);
      if (req.readyState == XMLHttpRequest.DONE) {
        let result: UploadResult = { canceled: false };
        if (req.status >= 200 && req.status < 300) {
          result.status = 'success';
          if (req.response) result.data = req.response;
        } else if (req.status == 0) {
          if (aborting) {
            result.canceled = true;
          } else {
            return; //reject() called by onerror
          }
        } else {
          result.status = 'failure';
          if (req.response) result.error = req.response;
        }
        resolve(result);
      }
    };
    req.onerror = e => {
      console.log('error', e);
      reject(e);
    };
    // req.onloadend = () => { progress = null; };
    req.send(file);

    return {
      progress,
      result,
      abort() {
        aborting = true;
        req.abort();
      }
    };
  }
}