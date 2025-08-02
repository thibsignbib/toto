"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-browser"

interface Guest {
  names: string[]
  presences: (boolean | null)[]
  regime_alimentaire: (string | null)[]
}

export default function StatsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGuests() {
      const { data, error } = await supabase
        .from("guests")
        .select("names, presences, regime_alimentaire")

      if (!error && data) {
        setGuests(data)
      }
      setLoading(false)
    }

    fetchGuests()
  }, [])

  const confirmedNames: string[] = []
  const namesToFollowUp: string[] = []
  const declinedNames: string[] = []

  let totalConfirmed = 0
  let totalVegetarian = 0
  let totalNonVegetarian = 0

  function annotateName(name: string, groupFirst: string): string {
    const lower = name.toLowerCase()
    if (lower.includes("éventuel") || lower.includes("éventuelle")) {
      return `${name} (${groupFirst})`
    }
    return name
  }

  guests.forEach((guest) => {
    guest.names.forEach((name, index) => {
      const annotatedName = annotateName(name, guest.names[0])

      const presence = guest.presences?.[index]
      const regime = guest.regime_alimentaire?.[index]

      if (presence === true) {
        confirmedNames.push(annotatedName)
        totalConfirmed++
        if (regime === "vege") totalVegetarian++
        if (regime === "non-vege") totalNonVegetarian++
      } else if (presence === false) {
        declinedNames.push(annotatedName)
      } else {
        namesToFollowUp.push(annotatedName)
      }
    })
  })

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-6 text-[#1B3A2F] space-y-6">
      <h1 className="text-3xl font-bold text-center">Statistiques</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-4">
          <p><strong>Nombre total d’invités :</strong> {guests.reduce((sum, g) => sum + g.names.length, 0)}</p>
          <p><strong>Nombre de repas végétariens confirmés :</strong> {totalVegetarian}</p>
          <p><strong>Nombre de repas non-végé confirmés :</strong> {totalNonVegetarian}</p>

          <div>
            <strong>✅ Liste des personnes confirmées ({confirmedNames.length}) :</strong>
            <ul className="list-disc list-inside text-green-700">
              {confirmedNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>🟠 Liste des personnes à relancer ({namesToFollowUp.length}) :</strong>
            <ul className="list-disc list-inside text-orange-600">
              {namesToFollowUp.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>❌ Liste des personnes ayant décliné ({declinedNames.length}) :</strong>
            <ul className="list-disc list-inside text-red-700">
              {declinedNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  )
}
