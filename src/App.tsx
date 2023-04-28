// Biblioteca de JavaScript que proporciona un motor de inferencia ONNX en la web
// Permite ejecutar modelos de aprendizaje automático en el navegador o en Node.js.
import { InferenceSession, Tensor } from "onnxruntime-web";
// React
import React, { useContext, useEffect, useState } from "react";
// Sass
import "./assets/scss/App.scss";
// Función de ayuda que se utiliza para escalar la imagen de entrada antes de pasarla al modelo SAM
import { handleImageScale } from "./components/helpers/scaleHelper";
// Trae la interfaz modelScaleProps. El archivo Interfaces.tsx define varias interfaces que se utilizan en diferentes partes del código.
import { modelScaleProps } from "./components/helpers/Interfaces";
// Trae la función onnxMaskToImage. El archivo maskUtils contiene un conjunto de funciones que se utilizan para convertir la máscara de segmentación generada por el modelo ONNX en una imagen HTML.
import { onnxMaskToImage } from "./components/helpers/maskUtils";
// La función modelData se utiliza para preparar los datos que se introducirán en un modelo ONNX.
import { modelData } from "./components/helpers/onnxModelAPI";
// Contiene una herramienta para realizar clics en una imagen
import Stage from "./components/Stage";
// Define un contexto de React
import AppContext from "./components/hooks/createContext";
// Importa el paquete "onnxruntime-web" y lo asigna a la constante "ort".
const ort = require("onnxruntime-web");
// El paquete npyjs proporciona una forma de cargar archivos de matriz de NumPy (.npy) en JavaScript.
/* @ts-ignore */
import npyjs from "npyjs";

// Ruta de la imagen
const IMAGE_PATH = "/assets/data/dog_hd.jpg";
// Ruta del modelo
const IMAGE_EMBEDDING = "/assets/data/dogs_hd.npy";
// Ruta del directorio
const MODEL_DIR = "/model/sam_onnx_quantized_example.onnx";

const App = () => {
  // Extraer las propiedades clicks, image y maskImg del contexto y asignándolas a variables específicas (clicks, setImage y setMaskImg), respectivamente.
  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
  } = useContext(AppContext)!;

  // Para almacenar el modelo ONNX.
  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  
  // Almacenar el tensor de incrustación de imagen.
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor

  // Mantener el registro de los valores de escala necesarios para preparar la entrada correcta para el modelo ONNX.
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  useEffect(() => {
    // Inicializa el modelo ONNX cargando los archivos necesarios desde un directorio específico y lo guarda en el estado "model" usando el método setModel.
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return;
        const URL: string = MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.log(e);
      }
    };
    initModel();

    // Carga una imagen usando la función loadImage y la URL de la imagen.
    const url = new URL(IMAGE_PATH, location.origin);
    loadImage(url);

    // Carga un tensor de incrustación de imagen precalculado utilizando la función loadNpyTensor y la ruta de acceso del tensor. 
    // Este tensor se guarda en el estado "tensor" usando el método setTensor.
    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(
      (embedding) => setTensor(embedding)
    );
  }, []);

  // Carga una imagen desde una URL y actualiza el estado modelScale y image del componente cuando la imagen ha sido cargada.
  const loadImage = async (url: URL) => {
    try {
      // Crea un objeto Image 
      const img = new Image();
      // Asigna la URL de la imagen a través de la propiedad src.
      img.src = url.href;
      // Función onload que se ejecutará una vez que la imagen haya terminado de cargar.
      img.onload = () => {
        // Se llama a la función handleImageScale pasando la imagen cargada como argumento. 
        // Esta función devuelve un objeto con tres propiedades: height, width y samScale. 
        const { height, width, samScale } = handleImageScale(img);
        // Actualizar el estado modelScale con los valores correspondientes.
        setModelScale({
          height: height,  // Altura de la imagen original
          width: width,  // Ancho de la imagen original
          samScale: samScale, // Factor de escala para la imagen que se ha redimensionado al lado más largo 1024
        });
        // Se actualiza la propiedad width y height del objeto Image con los valores devueltos por handleImageScale. 
        img.width = width; 
        img.height = height; 
        // Se actualiza el estado image con el objeto Image cargado.
        setImage(img);
      };
    } catch (error) {
      console.log(error);
    }
  };

  // Decodificar un archivo Numpy en un tensor.
  const loadNpyTensor = async (tensorFile: string, dType: string) => {
    // Se crea una instancia de la librería npyjs.
    let npLoader = new npyjs();
    // Se carga el archivo Numpy mediante npLoader.load(tensorFile). 
    // El resultado es un objeto npArray que contiene los datos del tensor Numpy. 
    const npArray = await npLoader.load(tensorFile);
    // Se crea un objeto ort.Tensor a partir de dType, npArray.data y npArray.shape y se retorna este tensor.
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  };

  // Cada vez que el usuario hace clic en la imagen para seleccionar un objeto, se ejecuta la función runONNX para generar la máscara de segmentación correspondiente.
  useEffect(() => {
    // Procesar la imagen y generar la máscara de segmentación.
    runONNX();
  }, [clicks]);

  // Se encarga de ejecutar el modelo ONNX cada vez que hay un cambio en el estado clicks, que se actualiza cuando el usuario hace clic en la imagen.
  const runONNX = async () => {
    try {
      // Verifica si el modelo ONNX, los clicks, la tensor y el modeloScale son distintos de null.
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
        // Si todo está en orden, se preparan los datos de entrada para el modelo y se ejecuta con la función run() del modelo.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;
        // Ejecute el modelo SAM ONNX con las fuentes devueltas por modelData()
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        // La máscara pronosticada devuelta por el modelo ONNX es una matriz que se representa como una imagen HTML mediante onnxMaskToImage() de maskUtils.tsx.
        // La función onnxMaskToImage() convierte la máscara predicha por el modelo ONNX en una imagen HTML y la establece en el estado maskImg.
        setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return <Stage />;
};

export default App;
