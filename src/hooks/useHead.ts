import { useEffect, useRef, useState } from 'react'
import { headFor, SITE } from '../lib/head'
import { jsonLdFor } from '../lib/jsonld'
import type { Route } from './useRoute'
import type { Technique } from '../types/judodex'

/** Pose ou met à jour un <link rel=...>, identifié par son rel et sa langue. */
function lien(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(sel)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

/** Pose ou met à jour une balise <meta>, sans jamais en accumuler deux. */
function meta(cle: 'name' | 'property', nom: string, contenu: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${cle}="${nom}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(cle, nom)
    document.head.appendChild(el)
  }
  el.setAttribute('content', contenu)
}

/**
 * Tient l'en-tête du document à jour, et annonce le changement de page.
 *
 * Deux choses se jouent ici, et elles vont ensemble. Un moteur de recherche
 * lit le titre et le résumé pour ranger la page ; un lecteur d'écran lit le
 * titre pour annoncer qu'on a changé d'écran. Dans une application à une seule
 * page, ni l'un ni l'autre ne se produit tout seul : la navigation ne recharge
 * rien, donc rien ne se réénonce. Le titre reste figé et l'utilisateur non
 * voyant se retrouve ailleurs sans qu'on le lui ait dit.
 */
export function useHead(route: Route, technique?: Technique | null, total?: number) {
  /** Ce que le lecteur d'écran doit entendre après le changement de route. */
  const [annonce, setAnnonce] = useState('')
  const premier = useRef(true)

  useEffect(() => {
    const { title, description, canonical, image, imageAlt } = headFor(route, technique)

    document.title = title
    meta('name', 'description', description)

    lien('canonical', canonical)

    // Le site n'existe qu'en français : on le dit, plutôt que de laisser un
    // moteur multilingue supposer qu'il manque des traductions.
    lien('alternate', canonical, 'fr-FR')
    lien('alternate', canonical, 'x-default')

    // Ce que voit celui à qui on partage l'adresse.
    meta('property', 'og:title', title)
    meta('property', 'og:description', description)
    meta('property', 'og:url', canonical)
    meta('property', 'og:type', route.name === 'technique' ? 'article' : 'website')
    meta('property', 'og:site_name', SITE)
    meta('property', 'og:locale', 'fr_FR')
    meta('property', 'og:image', image)
    meta('property', 'og:image:alt', imageAlt)
    meta('property', 'og:image:width', '1200')
    meta('property', 'og:image:height', '630')
    meta('name', 'twitter:card', 'summary_large_image')
    meta('name', 'twitter:title', title)
    meta('name', 'twitter:description', description)
    meta('name', 'twitter:image', image)
    meta('name', 'twitter:image:alt', imageAlt)

    // Données structurées : de quoi citer la page, pas seulement l'afficher.
    const marque = document.getElementById('donnees-structurees')
    const graphe = jsonLdFor(route, technique, total)
    if (!graphe) marque?.remove()
    else {
      const el = marque ?? document.createElement('script')
      el.id = 'donnees-structurees'
      el.setAttribute('type', 'application/ld+json')
      el.textContent = JSON.stringify(graphe)
      if (!marque) document.head.appendChild(el)
    }

    // Une page introuvable ne doit pas entrer dans l'index — pas davantage
    // une fiche dont le slug ne correspond à aucune technique.
    const introuvable = route.name === 'notFound' || (route.name === 'technique' && !technique)
    /*
     * Sans consigne, Google tronque le résumé et n'affiche qu'une vignette.
     * Les fiches ont une image de partage et une démonstration filmée : on
     * autorise explicitement le grand aperçu, sinon elles s'affichent
     * timidement dans les résultats et dans Discover.
     */
    meta(
      'name',
      'robots',
      introuvable
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    // Le premier affichage n'est pas un changement de page : le navigateur
    // vient déjà d'annoncer le titre du document.
    if (premier.current) {
      premier.current = false
      return
    }
    setAnnonce(title)
  }, [route, technique, total])

  return annonce
}
