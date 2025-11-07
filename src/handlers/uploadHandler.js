import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3();

export const main = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { imageBase64 } = body;

    if (!imageBase64) {
      return { statusCode: 400, body: "Falta el campo imageBase64" };
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const key = `${uuidv4()}.jpg`;

    await s3
      .putObject({
        Bucket: process.env.BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      })
      .promise();

    console.log(`Imagen subida: ${key}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Imagen subida correctamente", key }),
    };
  } catch (err) {
    console.error("Error subiendo imagen:", err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
