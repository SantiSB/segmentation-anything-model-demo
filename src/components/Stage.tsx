import React, { useContext } from "react";
// Se importa para utilizar la función throttle() que limita la frecuencia con la que se ejecuta una función.
import * as _ from "underscore";
// Componente React que representa la herramienta de selección de imágenes.
import Tool from "./Tool";
// Define el formato de los datos de entrada que se envían a un modelo de aprendizaje automático.
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";


// Stage renderiza la herramienta "Tool" y ajusta su tamaño para que se ajuste al tamaño de la ventana.
const Stage = () => {
  // Contexto de la aplicación, donde se almacena la imagen y los clics que se han realizado.
  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  // Recibe las coordenadas x e y del clic y devuelve un objeto que contiene estas coordenadas y un identificador de tipo de clic.
  const getClick = (x: number, y: number): modelInputProps => {
    const clickType = 1;
    return { x, y, clickType };
  };

  // Obtener la posición del mouse y escalar las coordenadas (x, y) de vuelta a lo natural escala de la imagen. 
  // Actualice el estado de los clics con setClicks para desencadenar el modelo ONNX para ejecutar y generar una nueva máscara a través de useEffect en App.tsx
  // La función throttle() se utiliza para limitar la frecuencia con la que se ejecuta handleMouseMove() para reducir la sobrecarga del procesamiento.
  const handleMouseMove = _.throttle((e: any) => {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y);
    // "setClicks" para almacenar el clic en el estado de la aplicación, lo que desencadenará una actualización de la máscara generada por el modelo ONNX en el componente principal "App.tsx".
    if (click) setClicks([click]);
  }, 15);

  const flexCenterClasses = "flex items-center justify-center";
  return (
    <div className={`${flexCenterClasses} w-full h-full`}>
      <div className={`${flexCenterClasses} relative w-[90%] h-[90%]`}>
        <Tool handleMouseMove={handleMouseMove} />
      </div>
    </div>
  );
};

export default Stage;
