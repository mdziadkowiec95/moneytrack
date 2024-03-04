const BASE_URL = 'https://nominatim.openstreetmap.org/reverse?format=json'

export const mapService = {
  getLocationByCoords: async (lat: number, lon: number) => {
    const response = await fetch(`${BASE_URL}&lat=${lat}&lon=${lon}`)
    const data = await response.json()
    return data
  },
}
