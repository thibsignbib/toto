"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"
import { toast } from "sonner"
import { Info } from "lucide-react"


interface Guest {
  id: number
  slug: string
  names: string[]
  type: string
  number_of_persons: number
  presences: boolean[]
  presence_number: number
  regime_alimentaire: string[]
  vendredi: boolean[]
  samedi: boolean[]
  dimanche: boolean[]
  langue: "fr" | "de"
}

const translations = {
  fr: {
    intro: (
      <>
        Nous avons le bonheur de vous convier à notre mariage qui aura lieu le 06/06/2026 à 14 heures à la mairie de Cusset. <br /><br />
        Et comme le temps passe trop vite quand on est entouré de ceux qu’on aime, nous serions vraiment heureux de vous accueillir dès le vendredi 5 juin, jusqu’au dimanche 7. <br />
        Un hébergement gratuit est donc déjà prévu pour vous sur le lieu des festivités. <br /><br />
        Le formulaire ci-dessous nous aidera à tout préparer, pourriez-vous le remplir d’ici le 1er septembre svp ? <br /><br />
        <strong>Rendez-vous au Domaine de la Saigne, 6 Rue de la Saigne, 03300 Creuzier-le-Vieux.</strong>
      </>
    ),
    confirmPresence: "Je confirme ma présence",
    vegetarian: "Végétarien",
    oui: "oui",
    non: "non",
    nonVegetarian: "Non végétarien",
    mealType: "Type de repas",
    iWillBeThere: "Je serai là...",
    friday: "La nuit du vendredi",
    saturday: "La nuit du samedi",
    sunday: "Le brunch du dimanche midi",
    info: "Un hébergement (gratuit) est déjà prévu pour vous, sur place, les deux nuits. Vous n’avez pas besoin d’en réserver un.",
    infochildren: (
      <>
        Le mariage n’ayant pas été adapté pour accueillir les plus jeunes, nous vous incitons à les faire garder et à vous <s>bourrer la gueule</s> lâcher. Comme nous savons que cette logistique est parfois compliquée, nous vous proposons quand même de choisir.
      </>
    ),
    submit: "Valider mes réponses",
    submitting: "Envoi en cours...",
    toastSuccess: "Merci ! Vos réponses ont bien été enregistrées.",
    toastError: "Une erreur est survenue. Veuillez réessayer.",
  },
  de: {
    intro: (
      <>
        Wir freuen uns, euch zu unserer Hochzeit am 06.06.2026 um 14 Uhr im Standesamt von Cusset einzuladen. <br /><br />
        Weil die Zeit mit unseren Lieblingsmenschen immer zu schnell vergeht, würden wir uns freuen, euch bereits ab Freitag, dem 5. Juni, bis Sonntag, dem 7., willkommen zu heißen. <br />
        Bitte füllt das untenstehende Formular bis spätestens zum 1. September aus, damit wir alles vorbereiten können. <br /><br />
        <strong>Treffpunkt: Domaine de la Saigne, 6 Rue de la Saigne, 03300 Creuzier-le-Vieux.</strong>
      </>
    ),
    confirmPresence: "Ich bestätige meine Anwesenheit",
    vegetarian: "Vegetarisch",
    oui: "ja",
    non: "nein",
    nonVegetarian: "Nicht vegetarisch",
    mealType: "Essen Auswahl",
    iWillBeThere: "Ich bin da...",
    friday: "Freitag Abends",
    saturday: "Samstag Abends",
    sunday: "Sonntagmittag Brunch",
    info: "Eine Unterkunft wirf für euch vorgesucht, für alle euch Nächte. Ihr müsst uns nur eure Plänne vorgeben.",
    infochildren: (
      <>
        Da die Hochzeit nicht auf die Jüngsten ausgelegt ist, empfehlen wir euch, die Kinder betreuen zu lassen und euch so richtig <s>die Birne wegzuknallen</s> gehen zu lassen. Da uns bewusst ist, dass es nicht immer einfach ist, eine Betreuung zu organisieren, geben wir euch trotzdem die Möglichkeit zu wählen.
      </>
    ),
    submit: "Antworten abschicken",
    submitting: "Wird gesendet...",
    toastSuccess: "Vielen Dank! Eure Antworten wurden gespeichert.",
    toastError: "Es ist ein Fehler aufgetreten. Bitte versucht es erneut.",
  }
}

export default function ClientInvitation({ slug }: { slug: string }) {
  const router = useRouter()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)

  const [presences, setPresences] = useState<boolean[]>([])
  const [regimes, setRegimes] = useState<string[]>([])
  const [vendredi, setVendredi] = useState<boolean[]>([])
  const [samedi, setSamedi] = useState<boolean[]>([])
  const [dimanche, setDimanche] = useState<boolean[]>([])
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  // Chargement des données invité
  useEffect(() => {
    async function fetchGuest() {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("slug", slug)
        .single<Guest>()

      if (!data || error) {
        router.replace("/404")
        return
      } else {
        setGuest(data)
        setPresences(data.presences ?? Array(data.names.length).fill(undefined))
        setRegimes(data.regime_alimentaire ?? Array(data.names.length).fill(""))
        setVendredi(data.vendredi ?? Array(data.names.length).fill(false))
        setSamedi(data.samedi ?? Array(data.names.length).fill(false))
        setDimanche(data.dimanche ?? Array(data.names.length).fill(false))
        setLoading(false)
      }
    }

    fetchGuest()
  }, [slug, router])

  // Chargement polices + image
  useEffect(() => {
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
  }, [])

  // Soumission du formulaire
  async function handleSubmit() {
    if (!guest) return
    setStatus("saving")

    const presence_number = presences.filter(Boolean).length

    const { error } = await supabase.from("guests").update({
      presences,
      regime_alimentaire: regimes,
      vendredi,
      samedi,
      dimanche,
      presence_number,
    }).eq("id", guest.id)

    if (error) {
      console.error("Erreur de mise à jour :", error)
      toast.error(translations[guest.langue || "fr"].toastError)
      setStatus("error")
    } else {
      toast.success(translations[guest.langue || "fr"].toastSuccess)
      setStatus("success")
    }
  }

  if (!guest || loading || !isReady) {
    return (
    <main className="min-h-screen flex items-center justify-center text-[#1B3A2F] p-6">
      <p className="text-xl text-kgWildways">Chargement...</p>
    </main>
    )
  }

  const t = translations[guest.langue || "fr"]

  return (
    <main className="min-h-screen text-[#1B3A2F] p-6 max-w-3xl mx-auto space-y-10">
      <h1 className="text-wedding titlelisathibault">Lisa & Thibault</h1>
      <img src="/lisathibaultT.png" alt="Lisa et Thibault" className="mx-auto lisathibaultimage" />
      <h1 className="text-3xl text-kgWildways-title font-medium text-center tracking-tight">
        {guest.names.slice(0, 2).join(", ")},
      </h1>

      <p className="text-kgWildways text-lg leading-relaxed backdrop-blur-sm p-4 rounded">
        {t.intro}
      </p>

      {guest.names.map((name, i) => (
        
        <section key={i} className="rounded-2xl border border-gray-200 p-6 bg-white/90 shadow-md space-y-6">
          {i > 1 && (
            <div className="flex items-start gap-2 text-sm text-[#1B3A2F]/80">
                  <Info className="infoT shrink-0" />
                  <p>{t.infochildren}</p>
                </div>
          )}
        
          <h3 className="text-xl font-semibold">{name}</h3>

          <fieldset className="space-y-2">
            <legend className="font-medium">{t.confirmPresence}</legend>
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`presence-${i}`}
                  checked={presences[i] === true}
                  onChange={() => {
                    const copy = [...presences]; copy[i] = true; setPresences(copy)
                  }}
                  className="accent-[#1B3A2F]"
                />
                {t.oui}
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`presence-${i}`}
                  checked={presences[i] === false}
                  onChange={() => {
                    const copy = [...presences]; copy[i] = false; setPresences(copy)
                  }}
                  className="accent-[#1B3A2F]"
                />
                {t.non}
              </label>
            </div>
          </fieldset>

          {presences[i] === true && (
            <>
              <div className="space-y-6 pt-2">
                <fieldset className="space-y-2">
                  <legend className="font-medium">{t.mealType}</legend>
                  <div className="flex gap-6">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`regime-${i}`}
                        value="vege"
                        checked={regimes[i] === "vege"}
                        onChange={() => {
                          const copy = [...regimes]; copy[i] = "vege"; setRegimes(copy)
                        }}
                        className="accent-[#1B3A2F]"
                      />
                      {t.vegetarian}
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`regime-${i}`}
                        value="non-vege"
                        checked={regimes[i] === "non-vege"}
                        onChange={() => {
                          const copy = [...regimes]; copy[i] = "non-vege"; setRegimes(copy)
                        }}
                        className="accent-[#1B3A2F]"
                      />
                      {t.nonVegetarian}
                    </label>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="font-medium">{t.iWillBeThere}</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={vendredi[i]}
                        onChange={(e) => {
                          const copy = [...vendredi]; copy[i] = e.target.checked; setVendredi(copy)
                        }}
                        className="accent-[#1B3A2F]"
                      />
                      {t.friday}
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={samedi[i]}
                        onChange={(e) => {
                          const copy = [...samedi]; copy[i] = e.target.checked; setSamedi(copy)
                        }}
                        className="accent-[#1B3A2F]"
                      />
                      {t.saturday}
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={dimanche[i]}
                        onChange={(e) => {
                          const copy = [...dimanche]; copy[i] = e.target.checked; setDimanche(copy)
                        }}
                        className="accent-[#1B3A2F]"
                      />
                      {t.sunday}
                    </label>
                  </div>
                </fieldset>

                <div className="flex items-start gap-2 text-sm text-[#1B3A2F]/80">
                  <Info className="infoT shrink-0" />
                  <p>{t.info}</p>
                </div>
              </div>
            </>
          )}
        </section>
      ))}

      <div className="text-center pt-4 buttonwithinimage">
        <button
          onClick={handleSubmit}
          disabled={status === "saving"}
          className="cursor-pointer bg-[#1B3A2F] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-900 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "saving" ? t.submitting : t.submit}
        </button>
      </div>

      <img src="/bicyclesT.png" alt="Bicycles" className="pointer-events-none" />
    </main>
  )
}
