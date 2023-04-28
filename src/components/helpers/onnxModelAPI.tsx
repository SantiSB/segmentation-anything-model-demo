import { Tensor } from "onnxruntime-web";
//Trae la interfaz modeDataProps. El archivo Interfaces.tsx define varias interfaces que se utilizan en diferentes partes del código.
import { modeDataProps } from "./Interfaces";

//Función que recibe como entrada un objeto que contiene clicks, tensor y modelScale. 
//Esta función se encarga de formatear estos datos de acuerdo a lo que se espera en el modelo de aprendizaje automático que se utilizará.
const modelData = ({ clicks, tensor, modelScale }: modeDataProps) => {
  const imageEmbedding = tensor;
  let pointCoords;
  let pointLabels;
  let pointCoordsTensor;
  let pointLabelsTensor;

  // Verifica si hay entradas de clics 
  if (clicks) {
    let n = clicks.length;

    // Si no hay una entrada, se debe concatenar un solo punto de relleno con la etiqueta -1 y las coordenadas (0.0, 0.0), 
    // Por lo tanto, inicialice la matriz para que admita (n + 1) puntos.
    pointCoords = new Float32Array(2 * (n + 1));
    pointLabels = new Float32Array(n + 1);

    // Agregue clics y escale a lo que espera SAM
    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.samScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.samScale;
      pointLabels[i] = clicks[i].clickType;
    }

    // Agregue el punto / etiqueta adicional cuando solo haga clic y no haya cuadro
    // El punto extra está en (0, 0) con la etiqueta -1
    pointCoords[2 * n] = 0.0;
    pointCoords[2 * n + 1] = 0.0;
    pointLabels[n] = -1.0;

    // Crea tensores a partir de estos datos 
    pointCoordsTensor = new Tensor("float32", pointCoords, [1, n + 1, 2]);
    pointLabelsTensor = new Tensor("float32", pointLabels, [1, n + 1]);
  }
  const imageSizeTensor = new Tensor("float32", [
    modelScale.height,
    modelScale.width,
  ]);

  if (pointCoordsTensor === undefined || pointLabelsTensor === undefined)
    return;

  // No hay una máscara anterior, por lo que el valor predeterminado es un tensor vacío.
  const maskInput = new Tensor(
    "float32",
    new Float32Array(256 * 256),
    [1, 1, 256, 256]
  );
  // No hay una máscara anterior, por lo que el valor predeterminado es 0
  const hasMaskInput = new Tensor("float32", [0]);

  // Devuelve los tensores junto con tensores adicionales que se inicializan como valores predeterminados, como maskInput y hasMaskInput.
  return {
    image_embeddings: imageEmbedding,
    point_coords: pointCoordsTensor,
    point_labels: pointLabelsTensor,
    orig_im_size: imageSizeTensor,
    mask_input: maskInput,
    has_mask_input: hasMaskInput,
  };
};

export { modelData };
