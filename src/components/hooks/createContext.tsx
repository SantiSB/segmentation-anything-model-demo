import { createContext } from "react";
import { modelInputProps } from "../helpers/Interfaces";

// Cada una de estas propiedades es un array con dos elementos: el primer elemento es el valor de la propiedad y el segundo elemento es una función para establecer el valor de la propiedad. 
interface contextProps {
  clicks: [
    clicks: modelInputProps[] | null,
    setClicks: (e: modelInputProps[] | null) => void
  ];
  image: [
    image: HTMLImageElement | null,
    setImage: (e: HTMLImageElement | null) => void
  ];
  maskImg: [
    maskImg: HTMLImageElement | null,
    setMaskImg: (e: HTMLImageElement | null) => void
  ];
}

const AppContext = createContext<contextProps | null>(null);

export default AppContext;
