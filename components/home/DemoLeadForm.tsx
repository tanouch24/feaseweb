"use client";

import { useState } from "react";

export function DemoLeadForm({ mode }: { mode: "create" | "redesign" }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center">
        <p className="font-serif text-xl text-ink">Merci !</p>
        <p className="mt-2 text-ink-soft">
          Ceci est une démonstration : dans le produit final, notre équipe
          reviendrait vers vous rapidement pour démarrer votre site.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5 rounded-lg border border-line bg-white p-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label htmlFor="company-name" className="text-sm font-medium text-ink">
          Nom de votre entreprise
        </label>
        <input
          id="company-name"
          name="companyName"
          type="text"
          required
          className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
        />
      </div>
      {mode === "redesign" && (
        <div>
          <label htmlFor="current-url" className="text-sm font-medium text-ink">
            Adresse de votre site actuel
          </label>
          <input
            id="current-url"
            name="currentUrl"
            type="url"
            required
            placeholder="https://"
            className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Votre email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Envoyer ma demande
      </button>
    </form>
  );
}
