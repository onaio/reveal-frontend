/** declare globals interface */
declare global {
  interface Window {
    maps: mapboxgl.Map[];
  }
  // const mapboxgl: typeof mapboxgl; TODO: fix this
}

// each file should be a module
export {};
