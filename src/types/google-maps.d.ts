declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          AutocompleteService: any;
          PlacesService: any;
        };
      };
    };
  }
}

export {};
