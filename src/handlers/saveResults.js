import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const main = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.Sns.Message);
      console.log("Mensaje recibido desde SNS:", message);

      const item = {
        Id: message.Id,
        FechaProcesamiento: new Date().toISOString(),
        Resultados: message.Resultados,
      };

      await dynamodb
        .put({
          TableName: process.env.DDB_TABLE,
          Item: item,
        })
        .promise();

      console.log(`Guardado en DynamoDB: ${message.Id}`);
    }

    return { statusCode: 200, body: "Datos almacenados en DynamoDB" };
  } catch (err) {
    console.error("Error guardando en DynamoDB:", err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
