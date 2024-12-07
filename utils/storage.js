const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;

const uploadFile = async (filePath, destination) => {
    await storage.bucket(bucketName).upload(filePath, {
        destination,
    });
    console.log(`${filePath} uploaded to ${bucketName}/${destination}`);
};

module.exports = { uploadFile };
