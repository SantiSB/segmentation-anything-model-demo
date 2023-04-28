// La función acepta una imagen HTML como entrada y devuelve un objeto que contiene la altura y el ancho de la imagen, así como la escala SAM necesaria para transformar la imagen a un tamaño compatible con el modelo.
// La función calcula la escala SAM dividiendo la longitud del lado más largo de la imagen por 1024 (que es el tamaño máximo que acepta SAM). Luego, devuelve la altura y el ancho de la imagen junto con la escala SAM necesaria.
// Esta función se utiliza para ajustar el tamaño de la imagen antes de pasarla al modelo SAM para la segmentación.
const handleImageScale = (image: HTMLImageElement) => {
  const LONG_SIDE_LENGTH = 1024;
  let w = image.naturalWidth;
  let h = image.naturalHeight;
  const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return { height: h, width: w, samScale };
};

export { handleImageScale };
