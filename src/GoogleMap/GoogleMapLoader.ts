import { Loader, LoaderOptions } from '@googlemaps/js-api-loader'

export default class GoogleMapLoader extends Loader {
  static gMapLoaderIns?: GoogleMapLoader = undefined
  private constructor(loaderOptions: LoaderOptions) {
    super(loaderOptions)
  }
  static RoutesLibrary: google.maps.RoutesLibrary

  static async load(loaderOptions: LoaderOptions) {
    if (GoogleMapLoader.gMapLoaderIns === void 0) {
      GoogleMapLoader.gMapLoaderIns = new GoogleMapLoader(loaderOptions)
      GoogleMapLoader.RoutesLibrary = await GoogleMapLoader.gMapLoaderIns.importLibrary('routes')
    }
    // GoogleMapLoader.MarkerLibrary = await GoogleMapLoader.gMapLoaderIns.importLibrary('marker')
    // GoogleMapLoader.MapsLibrary = await GoogleMapLoader.gMapLoaderIns.importLibrary('maps')
    // GoogleMapLoader.CoreLibrary = await GoogleMapLoader.gMapLoaderIns.importLibrary('core')
    return {
      RoutesLibrary: GoogleMapLoader.RoutesLibrary
    }
  }
}
