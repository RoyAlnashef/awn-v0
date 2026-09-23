"use client"

import * as React from "react"
import Map, { Marker } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"

import { homeBase, nearbyCrew } from "@/lib/now/now-data"
import { cn } from "@/lib/utils"

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()

function MapFallback() {
  return (
    <div
      className="absolute inset-0 bg-[repeating-linear-gradient(135deg,oklch(0.17_0.006_285.885)_0px,oklch(0.17_0.006_285.885)_12px,oklch(0.14_0.005_285.823)_12px,oklch(0.14_0.005_285.823)_24px)]"
      aria-hidden
    >
      <div className="absolute top-[38%] left-[54%] size-2 rounded-full bg-muted-foreground/40" />
      <div className="absolute top-[52%] left-[42%] size-2 rounded-full bg-muted-foreground/30" />
      <div className="absolute top-[46%] left-[48%]">
        <span className="absolute inline-flex size-4 animate-ping rounded-full bg-chart-2/40" />
        <span className="relative inline-flex size-3 rounded-full bg-chart-2 ring-4 ring-chart-2/20" />
      </div>
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">
        Map tiles — AWN dark
      </p>
    </div>
  )
}

export function NowMap({ className }: { className?: string }) {
  const [ready, setReady] = React.useState(false)

  if (!mapboxToken) {
    return <MapFallback />
  }

  return (
    <div className={cn("absolute inset-0", className)}>
      {!ready ? <MapFallback /> : null}
      <div className={cn("size-full", !ready && "opacity-0")}>
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: homeBase.longitude,
          latitude: homeBase.latitude,
          zoom: 11.5,
        }}
        mapStyle="mapbox://styles/awnroy/cmudf5a6z00ai01smeysi7h70"
        attributionControl={false}
        reuseMaps
        onLoad={() => setReady(true)}
        style={{ width: "100%", height: "100%" }}
      >
        <Marker longitude={homeBase.longitude} latitude={homeBase.latitude} anchor="center">
          <div className="relative">
            <span className="absolute inline-flex size-4 animate-ping rounded-full bg-chart-2/40" />
            <span className="relative inline-flex size-3 rounded-full bg-chart-2 ring-4 ring-chart-2/20" />
          </div>
        </Marker>
        {nearbyCrew.map((member) => (
          <Marker
            key={member.id}
            longitude={member.longitude}
            latitude={member.latitude}
            anchor="center"
          >
            <span className="inline-flex size-2 rounded-full bg-muted-foreground/50" />
          </Marker>
        ))}
      </Map>
      </div>
    </div>
  )
}
