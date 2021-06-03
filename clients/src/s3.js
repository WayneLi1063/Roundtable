const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentityPool, } = require("@aws-sdk/credential-provider-cognito-identity");
const { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

const albumBucketName = "roundtablefinder";
const bucketRegion = "us-west-1";
const IdentityPoolId = "us-west-1:28fdba59-1304-427e-8879-19f3d8c15844";

const s3 = new S3Client({
    region: bucketRegion,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: bucketRegion }),
      identityPoolId: IdentityPoolId, // IDENTITY_POOL_ID
    }),
  });

// List the photo albums that exist in the bucket
const listAlbums = async () => {
    try {
      const data = await s3.send(
          new ListObjectsCommand({ Delimiter: "/", Bucket: albumBucketName })
      );
  
      if (data.CommonPrefixes === undefined) {
        return ""
      } else {
        var albumNames = ""
        data.CommonPrefixes.map(function (commonPrefix) {
          var prefix = commonPrefix.Prefix;
          var albumName = decodeURIComponent(prefix.replace("/", ""));
          albumNames = albumNames + " " + albumName
        })
        return albumNames
        }
    } catch (err) {
      return alert("There was an error listing your albums: " + err.message);
    }
  };
  
  // Create an album in the bucket
const createAlbum = async (albumName) => {
    albumName = albumName.trim();
    if (!albumName) {
      return alert("Album names must contain at least one non-space character.");
    }
    if (albumName.indexOf("/") !== -1) {
      return alert("Album names cannot contain slashes.");
    }
    var albumKey = encodeURIComponent(albumName);
    try {
      const key = albumKey + "/";
      const params = { Bucket: albumBucketName, Key: key };
      const data = await s3.send(new PutObjectCommand(params));
      alert("Successfully created album.");
    } catch (err) {
      return alert("There was an error creating your album: " + err.message);
    }
  };

  // Add a photo to an album
const addPhoto = async (albumName, imgFile) => {
      const albumPhotosKey = encodeURIComponent(albumName) + "/";
      const data = await s3.send(
          new ListObjectsCommand({
            Prefix: albumPhotosKey,
            Bucket: albumBucketName
          })
      );
      const fileName = imgFile.name;
      const photoKey = albumPhotosKey + fileName;
      const uploadParams = {
        Bucket: albumBucketName,
        Key: photoKey,
        Body: imgFile
      };
      try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        console.log("Successfully uploaded photo.");
      } catch (err) {
        console.log("There was an error uploading your photo: ", err.message);
      }
}

module.exports = {
    albumBucketName, listAlbums, bucketRegion, createAlbum, addPhoto
}