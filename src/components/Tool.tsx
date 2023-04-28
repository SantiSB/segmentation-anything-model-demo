import React, { useContext, useEffect, useState } from "react";
import AppContext from "./hooks/createContext";
// Define las propiedades esperadas por el componente Tool.
import { ToolProps } from "./helpers/Interfaces";
import * as _ from "underscore";

// Se encarga de renderizar una imagen y su máscara correspondiente. 
// También maneja el cambio de tamaño de la página y ajusta el tamaño de la imagen y su máscara para adaptarlos al ancho o alto de la página según sea necesario.
// La propiedad handleMouseMove es una función que se llama cuando el cursor del ratón se mueve sobre la imagen.
// Acepta un objeto ToolProps como su única propiedad.
const Tool = ({ handleMouseMove }: ToolProps) => {
  // El estado de la imagen y su máscara se extraen del contexto de la aplicación.
  const {
    image: [image],
    maskImg: [maskImg, setMaskImg],
  } = useContext(AppContext)!;

  // Para determinar si se debe ajustar la imagen al ancho o alto de la página.
  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  // Se utiliza para determinar si se debe ajustar la imagen al ancho o alto de la página y se ejecuta cuando el tamaño de la página cambia
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  // Monitorea el tamaño del elemento body y llama a fitToPage cuando cambia.
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === bodyEl) {
        fitToPage();
      }
    }
  });
  useEffect(() => {
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);

  // Clases CSS para ajustar el tamaño de las imágenes y su opacidad. 
  const imageClasses = "";
  const maskImageClasses = `absolute opacity-40 pointer-events-none`;

  // Render the image and the predicted mask image on top
  return (
    <>
      {image && (
        <img
          // La imagen se maneja mediante un evento onMouseMove
          onMouseMove={handleMouseMove}
          // onMouseOut se usa para ocultar la máscara.
          onMouseOut={() => _.defer(() => setMaskImg(null))}
          onTouchStart={handleMouseMove}
          src={image.src}
          className={`${
            shouldFitToWidth ? "w-full" : "h-full"
          } ${imageClasses}`}
        ></img>
      )}
      {maskImg && (
        <img
          src={maskImg.src}
          className={`${
            shouldFitToWidth ? "w-full" : "h-full"
          } ${maskImageClasses}`}
        ></img>
      )}
    </>
  );
};

export default Tool;
