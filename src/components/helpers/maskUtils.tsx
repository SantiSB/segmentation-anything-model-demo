// Convierte la máscara de segmentación generada por el modelo ONNX, que se almacena como un array de números, en un objeto ImageData, que es una representación de píxeles de una imagen en JavaScript. 
// La función itera a través de los valores de la máscara de segmentación y establece los valores de los píxeles de la imagen en función de si el valor de la máscara de segmentación es mayor que cero o no.
function arrayToImageData(input: any, width: number, height: number) {
  const [r, g, b, a] = [0, 114, 189, 255]; // the masks's blue color
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {

    // Umbral de la predicción de la máscara del modelo onnx en 0.0
    // Esto es equivalente a establecer el umbral de la máscara usando predictor.model.mask_threshold en python 
    if (input[i] > 0.0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, height, width);
}

// Toma un objeto ImageData y devuelve un objeto Image que se puede utilizar para mostrar la imagen en una página web.
function imageDataToImage(imageData: ImageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

// Toma un objeto ImageData y devuelve un objeto Canvas que se puede utilizar para dibujar la imagen.
function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
}

// Es la función principal que se utiliza para convertir la máscara de segmentación generada por el modelo ONNX en una imagen HTML. 
// Toma el array de la máscara de segmentación y sus dimensiones (ancho y alto) como entrada y devuelve un objeto Image que representa la imagen segmentada.
export function onnxMaskToImage(input: any, width: number, height: number) {
  return imageDataToImage(arrayToImageData(input, width, height));
}
