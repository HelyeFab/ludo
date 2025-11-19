declare module 'backblaze-b2' {
  export default class B2 {
    constructor(options: { applicationKeyId: string; applicationKey: string });
    accountId: string;
    authorize(): Promise<any>;
    listBuckets(options: { accountId?: string; bucketName?: string }): Promise<any>;
    getUploadUrl(options: { bucketId: string }): Promise<any>;
    uploadFile(options: {
      uploadUrl: string;
      uploadAuthToken: string;
      fileName: string;
      data: Buffer;
      contentType?: string;
    }): Promise<any>;
    deleteFileVersion(options: { fileId: string; fileName: string }): Promise<any>;
    listFileVersions(options: {
      bucketId: string;
      startFileName?: string;
      maxFileCount?: number;
    }): Promise<any>;
    getDownloadAuthorization(options: {
      bucketId: string;
      fileNamePrefix: string;
      validDurationInSeconds: number;
    }): Promise<any>;
  }
}
