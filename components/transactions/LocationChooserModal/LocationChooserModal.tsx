'use client'

import { DrawingPinFilledIcon } from '@radix-ui/react-icons'
import { Button, Dialog, Flex, IconButton, TextField } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import MapSelection from './MapSelection'
import { LeafletMouseEvent, Map } from 'leaflet'
import { mapService } from '@/app/services/mapService'

export type OpenApiLocation = {
  display_name: string
  lat: number
  lon: number
}

type LocationChooserModalProps = {
  onTriggerClick: () => void
  onLocationChange: (location: OpenApiLocation) => void
}

type MapPosition = Pick<LeafletMouseEvent['latlng'], 'lat' | 'lng'>

const LocationChooserModal = ({
  onTriggerClick,
  onLocationChange,
}: LocationChooserModalProps) => {
  const [open, setOpen] = useState(false)
  const [map, setMap] = useState<Map | null>(null)
  const [position, setPosition] = useState<MapPosition>({
    lat: 51.5074,
    lng: -0.1278,
  })
  const [locationName, setLocationName] = useState('')

  const [selectedLocation, setSelectedLocation] =
    useState<OpenApiLocation | null>()

  useEffect(() => {
    if (map) {
      map.setView([position.lat, position.lng], map.getZoom())
    }
  }, [position, map])

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (open) {
        const { lat, lng } = position

        const locationData = (await mapService.getLocationByCoords(
          lat,
          lng
        )) as OpenApiLocation

        setSelectedLocation(locationData)
        setLocationName(locationData.display_name)
      }
    }

    fetchLocationDetails()
  }, [open, position, onLocationChange])

  const onSaveClick = () => {
    onLocationChange(selectedLocation!)
  }

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger>
        <IconButton
          onClick={onTriggerClick}
          variant="ghost"
          className="mr-3 ease-in-out duration-200 text-blue-500 hover:text-white"
        >
          <DrawingPinFilledIcon />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 700 }}>
        <TextField.Input
          value={locationName}
          onChange={(event) => {
            setLocationName(event.target.value)
          }}
        />

        <MapSelection
          setMap={setMap}
          zoom={13}
          position={position}
          setPosition={setPosition}
        />

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={onSaveClick}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default LocationChooserModal
