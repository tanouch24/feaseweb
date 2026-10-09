/**
 * Vidéos de vrais clients FeaseWeb (UGC), affichées sur l'accueil.
 *
 * Tant que la liste est vide, la section n'apparaît pas.
 * Pour ajouter une vidéo :
 * 1. déposer la vidéo verticale (9:16, MP4, moins de 8 Mo) dans public/videos/clients/
 *    et une image d'aperçu (JPG) au même endroit ;
 * 2. ajouter une entrée ci-dessous.
 *
 * Uniquement de vrais clients, avec leur accord écrit (droit à l'image).
 * Présenter un acteur comme un client est une pratique commerciale trompeuse.
 */
export type ClientVideo = {
  /** Prénom ou nom affiché, tel que le client l'a accepté. */
  name: string;
  /** Ex. « Plombier », « Coiffeuse ». */
  trade: string;
  city: string;
  /** Une phrase réellement prononcée dans la vidéo. */
  quote: string;
  /** Chemin depuis public/, ex. "/videos/clients/marc.mp4". */
  src: string;
  poster: string;
  /** Adresse du site du client, si elle peut être montrée. */
  siteUrl?: string;
};

export const clientVideos: ClientVideo[] = [];
