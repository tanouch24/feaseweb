"use client";

export default function ConnexionPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-serif text-3xl text-ink">Connexion</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Démonstration — aucune authentification réelle.
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-medium text-ink">
            Mot de passe
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}
