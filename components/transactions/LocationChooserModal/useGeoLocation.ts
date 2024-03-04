import { useEffect, useState } from 'react'

const useGeoLocation = () => {
  const [loading, setLoading] = useState(true)
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)

  useEffect(() => {
    if (window.navigator.geolocation) {
      setLoading(true)

      navigator.geolocation.getCurrentPosition(
        function (position) {
          setLoading(false)
          setCoords(position.coords)
        },
        function (error) {
          setLoading(false)
          console.error('Error occurred. Error code: ' + error.code)
          // error.code can be:
          // 0: unknown error
          // 1: permission denied
          // 2: position unavailable (error response from location provider)
          // 3: timed out
        }
      )
    } else {
      console.log('Geolocation is not supported by this browser.')
    }
  }, [])

  return {
    coords,
    loading,
  }
}

export default useGeoLocation
