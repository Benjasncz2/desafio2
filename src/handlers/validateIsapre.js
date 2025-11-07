import AWS from "aws-sdk";

const sns = new AWS.SNS();

export const main = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.Sns.Message);
      console.log("Validando datos de:", message.Id);

      // Ejemplo simple de validación
      const camposValidos = message.Resultados?.length > 0;

      const payload = {
        Id: message.Id,
        Validado: camposValidos,
        Resultados: message.Resultados,
        FechaValidacion: new Date().toISOString(),
      };

      await sns
        .publish({
          Message: JSON.stringify(payload),
          TopicArn: process.env.SNS_ISAPRE_ARN,
        })
        .promise();

      console.log("Datos validados enviados a ISAPRE SNS");
    }

    return { statusCode: 200, body: "Validación completada" };
  } catch (err) {
    console.error("Error validando datos:", err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
