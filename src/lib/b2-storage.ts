import B2 from "backblaze-b2";
import pRetry from "p-retry";

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!,
});

let authCache: { authorizationToken: string; apiUrl: string; downloadUrl: string; expiresAt: number } | null = null;

/**
 * Authorize with B2 and cache the token
 */
async function authorize() {
  // Return cached auth if still valid (expires in 24 hours, we refresh after 23 hours)
  if (authCache && authCache.expiresAt > Date.now()) {
    return authCache;
  }

  const response = await b2.authorize();

  authCache = {
    authorizationToken: response.data.authorizationToken,
    apiUrl: response.data.apiUrl,
    downloadUrl: response.data.downloadUrl,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000, // 23 hours
  };

  return authCache;
}

/**
 * Get bucket ID by name
 */
async function getBucketId(): Promise<string> {
  const auth = await authorize();

  const bucketsResponse = await b2.listBuckets({
    accountId: b2.accountId,
    bucketName: process.env.B2_BUCKET_NAME,
  });

  const bucket = bucketsResponse.data.buckets.find(
    (b: any) => b.bucketName === process.env.B2_BUCKET_NAME
  );

  if (!bucket) {
    throw new Error(`Bucket ${process.env.B2_BUCKET_NAME} not found`);
  }

  return bucket.bucketId;
}

/**
 * Upload a file to B2 with retry logic
 */
export async function uploadToB2(
  file: File,
  path: string
): Promise<{ fileId: string; fileName: string; downloadUrl: string }> {
  return pRetry(
    async () => {
      const auth = await authorize();
      const bucketId = await getBucketId();

      // Get upload URL
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId,
      });

      const uploadUrl = uploadUrlResponse.data.uploadUrl;
      const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload file
      const uploadResponse = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken,
        fileName: path,
        data: buffer,
        contentType: file.type,
      });

      const downloadUrl = `${auth.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${path}`;

      return {
        fileId: uploadResponse.data.fileId,
        fileName: uploadResponse.data.fileName,
        downloadUrl,
      };
    },
    {
      retries: 3,
      onFailedAttempt: (error) => {
        console.log(
          `Upload attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
          error.message
        );
      },
    }
  );
}

/**
 * Delete a file from B2 with retry logic
 */
export async function deleteFromB2(fileName: string): Promise<void> {
  await authorize();

  try {
    await pRetry(
      async () => {
        // Get file info first
        const fileVersions = await b2.listFileVersions({
          bucketId: await getBucketId(),
          startFileName: fileName,
          maxFileCount: 1,
        });

        const file = fileVersions.data.files.find(
          (f: any) => f.fileName === fileName
        );

        if (file) {
          await b2.deleteFileVersion({
            fileId: file.fileId,
            fileName: file.fileName,
          });
        }
      },
      {
        retries: 2,
        onFailedAttempt: (error) => {
          console.log(
            `Delete attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
            fileName
          );
        },
      }
    );
  } catch (error) {
    console.error("Failed to delete from B2:", fileName, error);
    // Don't throw - file might already be deleted
  }
}

/**
 * Get a signed download URL for a private file
 */
export async function getSignedUrl(fileName: string, validDurationInSeconds: number = 3600): Promise<string> {
  const auth = await authorize();

  const response = await b2.getDownloadAuthorization({
    bucketId: await getBucketId(),
    fileNamePrefix: fileName,
    validDurationInSeconds,
  });

  return `${auth.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${fileName}?Authorization=${response.data.authorizationToken}`;
}

/**
 * Download a file from B2
 */
export async function downloadFromB2(fileName: string): Promise<{ buffer: Buffer; contentType: string }> {
  const auth = await authorize();

  const downloadUrl = `${auth.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${fileName}`;

  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: auth.authorizationToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download from B2: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "application/octet-stream";

  return { buffer, contentType };
}
