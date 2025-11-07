import AWS from "aws-sdk";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

const sns = new AWS.SNS();
const s3 = new AWS.S3();

export const main = async (event) => {
  try {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    console.log(`Procesando imagen: ${key}`);

    const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const imageBuffer = data.Body;

    const client = new DocumentProcessorServiceClient({
      apiEndpoint: `${process.env.DOCUMENT_AI_LOCATION}-documentai.googleapis.com`,
      keyFilename: "credenciales.json",
    });

    const name = client.processorVersionPath(
      process.env.DOCUMENT_AI_PROJECT_ID,
      process.env.DOCUMENT_AI_LOCATION,
      process.env.DOCUMENT_AI_PROCESSOR_ID,
      process.env.DOCUMENT_AI_PROCESSOR_VERSION_ID
    );

    const [result] = await client.processDocument({
      name,
      rawDocument: { content: imageBuffer, mimeType: "image/jpeg" },
    });

    const doc = result.document;
    const entities =
      doc.entities?.map((e) => ({
        campo: e.type_,
        valor: e.mentionText,
        confianza: e.confidence,
      })) || [];

    const message = JSON.stringify({ Id: key, Resultados: entities });

    await sns
      .publish({
        Message: message,
        TopicArn: process.env.SNS_DOCAI_ARN,
      })
      .promise();

    console.log("Resultados enviados a SNS");
    return { statusCode: 200, body: message };
  } catch (err) {
    console.error("Error procesando imagen:", err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
