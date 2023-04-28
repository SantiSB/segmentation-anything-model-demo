import { Tensor } from "onnxruntime-web";

// Define las propiedades necesarias para ajustar el tamaño de una imagen antes de pasarla al modelo SAM. Incluye la escala SAM necesaria, la altura y el ancho de la imagen.
export interface modelScaleProps {
  samScale: number;
  height: number;
  width: number;
}

//Define las propiedades de entrada necesarias para realizar una segmentación de una imagen. Incluye las coordenadas x e y donde se hace clic, así como el tipo de clic clickType.
export interface modelInputProps {
  x: number;
  y: number;
  clickType: number;
}

// Define las propiedades de datos necesarias para realizar la segmentación de una imagen. 
// Incluye un conjunto opcional de clics (clicks) que se utilizan para guiar la segmentación, así como el tensor de entrada al modelo y las propiedades de escala.
export interface modeDataProps {
  clicks?: Array<modelInputProps>;
  tensor: Tensor;
  modelScale: modelScaleProps;
}

// Define las propiedades necesarias para utilizar una herramienta de segmentación. 
// En particular, incluye una función handleMouseMove que se llama cuando se mueve el mouse en la imagen de entrada.
export interface ToolProps {
  handleMouseMove: (e: any) => void;
}
