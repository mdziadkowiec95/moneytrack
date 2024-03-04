'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import { LeafletMouseEvent, Map, Marker as MarkerCore } from 'leaflet'
import useGeoLocation from './useGeoLocation'

type MapPosition = Pick<LeafletMouseEvent['latlng'], 'lat' | 'lng'>

function DraggableMarker({
  center,
  position,
  setPosition,
}: {
  center?: MapPosition
  position: MapPosition
  setPosition: (position: MapPosition) => void
}) {
  const markerRef = useRef<MarkerCore | null>(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current

        if (marker != null) {
          setPosition(marker.getLatLng())
        }
      },
    }),
    [setPosition]
  )

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position ?? center}
      ref={markerRef}
    ></Marker>
  )
}

const MarkerPin = ({
  setPosition,
}: {
  position: MapPosition
  setPosition: (position: MapPosition) => void
}) => {
  useMapEvents({
    dblclick(event) {
      setPosition(event.latlng)
    },
  })

  return null
}

const MapSelection = ({
  position,
  zoom,
  setPosition,
  setMap,
}: {
  position: MapPosition
  zoom: number
  setPosition: (position: MapPosition) => void
  setMap: (map: Map | null) => void
}) => {
  const { coords } = useGeoLocation()

  useEffect(() => {
    if (coords) {
      setPosition({
        lat: coords.latitude,
        lng: coords.longitude,
      })
    }
  }, [coords, setPosition])

  const MapMemoized = useMemo(
    () => (
      <MapContainer
        center={position}
        zoom={zoom}
        ref={setMap}
        style={{
          height: '500px',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerPin position={position} setPosition={setPosition} />
        <DraggableMarker position={position} setPosition={setPosition} />
      </MapContainer>
    ),
    [position, zoom, setMap, setPosition]
  )

  if (typeof window === 'undefined') return null

  return MapMemoized
}

export default MapSelection
