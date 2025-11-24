import COS from "cos-nodejs-sdk-v5";
import STS from "qcloud-cos-sts";
import { generateUniqueFileName } from "../utils/upload";
const config = {
  secretId: process.env.COS_SECRET_ID,
  secretKey: process.env.COS_SECRET_KEY,
  bucket: "hacxy-1259720482",
  region: "ap-hongkong",
  durationSeconds: 1800,
  allowPrefix: "public/*",
};

// const shortBucketName = config.bucket.substr(0, config.bucket.lastIndexOf("-"));
const appId = config.bucket.substr(1 + config.bucket.lastIndexOf("-"));

const policy = {
  version: "2.0",
  statement: [
    {
      action: [
        // 简单上传
        "name/cos:PutObject",
        "name/cos:PostObject",
        // 分片上传
        "name/cos:InitiateMultipartUpload",
        "name/cos:ListMultipartUploads",
        "name/cos:ListParts",
        "name/cos:UploadPart",
        "name/cos:CompleteMultipartUpload",
        // 简单上传和分片，需要以上权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923

        // 文本审核任务
        "name/ci:CreateAuditingTextJob",
        // 开通媒体处理服务
        "name/ci:CreateMediaBucket",
        // 更多数据万象授权可参考：https://cloud.tencent.com/document/product/460/41741
      ],
      effect: "allow",
      principal: { qcs: ["*"] },
      resource: [
        // cos相关授权，按需使用
        "qcs::cos:" +
          config.region +
          ":uid/" +
          appId +
          ":" +
          config.bucket +
          "/" +
          config.allowPrefix,
        // ci相关授权，按需使用
        "qcs::ci:" +
          config.region +
          ":uid/" +
          appId +
          ":bucket/" +
          config.bucket +
          "/*",
      ],
      // condition生效条件，关于 condition 的详细设置规则和COS支持的condition类型可以参考https://cloud.tencent.com/document/product/436/71306
      // 'condition': {
      //   // 比如限定ip访问
      //   'ip_equal': {
      //     'qcs:ip': '10.121.2.10/24'
      //   }
      // }
    },
  ],
};

const getTempCredential = () => {
  return new Promise<{
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
    startTime: number;
    expiredTime: number;
  }>((resolve, reject) => {
    STS.getCredential(
      {
        secretId: config.secretId!,
        secretKey: config.secretKey!,
        // proxy: config.proxy,
        durationSeconds: config.durationSeconds,
        region: config.region,
        // endpoint: config.endpoint,
        policy: policy,
      },
      function (err, credential) {
        // console.log("getCredential:");
        // console.log(JSON.stringify(policy, null, "    "));
        // console.log(err );
        if (err) {
          reject(err);
        }

        resolve({
          ...credential.credentials,
          startTime: credential.startTime,
          expiredTime: credential.expiredTime,
        });
      }
    );
  });
};

export const cos = new COS({
  getAuthorization: async (_, callback) => {
    const credential = await getTempCredential();
    callback({
      TmpSecretId: credential.tmpSecretId,
      TmpSecretKey: credential.tmpSecretKey,
      XCosSecurityToken: credential.sessionToken,
      StartTime: credential.startTime,
      ExpiredTime: credential.expiredTime,
    });
  },
});

export const uploadFile = async (file: File) => {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const data = await cos.putObject({
    Bucket: "hacxy-1259720482",
    Region: "ap-hongkong",
    Key: `public/${generateUniqueFileName(file.name)}`,
    Body: fileBuffer,
  });
  return data.Location;
};

/**
 * 上传多个文件到COS
 * @param files 文件数组
 * @returns 返回每个文件的上传结果，包含原始文件名和URL
 */
export const uploadMultipleFiles = async (
  files: File[]
): Promise<Array<{ originName: string; url: string }>> => {
  // 并行上传所有文件
  const uploadPromises = files.map(async (file) => {
    try {
      const url = await uploadFile(file);
      return {
        originName: file.name,
        url,
      };
    } catch (error) {
      // 如果某个文件上传失败，返回错误信息
      throw new Error(
        `文件 ${file.name} 上传失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });

  // 等待所有文件上传完成
  return Promise.all(uploadPromises);
};
export const getFileUrl = async (key: string) => {
  const data = await cos.getObjectUrl({
    Bucket: "hacxy-1259720482",
    Region: "ap-hongkong",
    Key: key,
  });
  return data;
};
