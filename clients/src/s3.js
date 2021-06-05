const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentityPool, } = require("@aws-sdk/credential-provider-cognito-identity");
const { S3Client, PutObjectCommand, ListObjectsCommand } = require("@aws-sdk/client-s3");

export const albumBucketName = "roundtablefinder";
export const bucketRegion = "us-west-1";
const IdentityPoolId = "us-west-1:28fdba59-1304-427e-8879-19f3d8c15844";

const s3 = new S3Client({
    region: bucketRegion,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: bucketRegion }),
      identityPoolId: IdentityPoolId, // IDENTITY_POOL_ID
    }),
  });

// Add a photo to an album
export const AddPhoto = async (albumName, imgFile, photoKeyName, callback) => {
      const albumPhotosKey = encodeURIComponent(albumName) + "/";
      await s3.send(
          new ListObjectsCommand({
            Prefix: albumPhotosKey,
            Bucket: albumBucketName
          })
      );
      const fileName = imgFile.name;
      let photoKey = "";
      if (photoKeyName === "") {
        photoKey = albumPhotosKey + fileName;
      } else {
        photoKey = albumPhotosKey + photoKeyName;
      }
      const uploadParams = {
        Bucket: albumBucketName,
        Key: photoKey,
        Body: imgFile
      };
      try {
        await s3.send(new PutObjectCommand(uploadParams));
        console.log("Successfully uploaded photo.");
        if (typeof callback === "function") {
          callback()
        }
      } catch (err) {
        console.error("There was an error uploading your photo: ", err.message);
      }
}