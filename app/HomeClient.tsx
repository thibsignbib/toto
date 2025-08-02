"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-browser"

export default function HomeClient() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Chargement polices + image
    const fontPromise = document.fonts.ready

    const image = new Image()
    image.src = "/lisathibaultT.png"
    const imagePromise = new Promise((resolve) => {
      image.onload = resolve
      image.onerror = resolve
    })

    Promise.all([fontPromise, imagePromise]).then(() => {
      setIsReady(true)
    })

    // Optionnel : debug Supabase
    async function fetchGuests() {
      const { data, error } = await supabase.from("guests").select("*")
      console.log(data, error)
    }

    fetchGuests()
  }, [])

  if (!isReady) {
    return (
      <main className="min-h-screen flex items-center justify-center text-[#1B3A2F] p-6">
        <p className="text-xl text-kgWildways">Chargement...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-[#1B3A2F] p-6 space-y-6">
      <img
        src="/lisathibaultT.png"
        alt="Lisa & Thibault"
        className="w-full max-w-md sm:max-w-lg md:max-w-xl h-auto mb-4 homepagepicture"
      />
      <h1 className="text-wedding text-wedding-home text-4xl sm:text-6xl text-center">Lisa & Thibault</h1>
      <p className="text-kgWildways text-lg leading-relaxed backdrop-blur-sm p-4 rounded text-center">
        Cliquez sur le lien envoyé par nos soins pour retrouver le faire-part personnalisé !
      </p>
    </main>
  )
}
