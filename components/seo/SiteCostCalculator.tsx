"use client";

import { useMemo, useState } from "react";
import {
  calculateSiteCost,
  compareSiteCosts,
  DURATIONS,
  feaseWebScenario,
  type SiteCostInputs,
} from "@/lib/site-cost-calculator";

type Scenario = SiteCostInputs & { name: string; note: string };

const blankScenario = (name: string, note: string): Scenario => ({
  name,
  note,
  initialCost: 0,
  monthlyCost: 0,
  annualDomain: 0,
  annualMaintenance: 0,
  annualSeo: 0,
  annualSupport: 0,
  years: 3,
});

const presets: Record<string, Scenario> = {
  diy: blankScenario("DIY / plateforme", "Scénario à compléter selon l’outil et les options retenus."),
  freelance: blankScenario("Freelance", "Scénario à compléter avec le devis et le niveau de suivi prévu."),
  agency: blankScenario("Agence", "Scénario à compléter avec le périmètre et le contrat proposés."),
  managed: blankScenario("Service géré", "Scénario à compléter selon l’offre étudiée."),
  feaseweb: { ...feaseWebScenario, name: "FeaseWeb", note: "Exemple factuel : 49 €/mois, création sans frais de création." },
};

const fields: Array<{ key: keyof Omit<SiteCostInputs, "years">; label: string; unit: string; help: string }> = [
  { key: "initialCost", label: "Coût initial de création", unit: "€", help: "Ce qui est payé au démarrage." },
  { key: "monthlyCost", label: "Coût mensuel récurrent", unit: "€/mois", help: "Abonnement ou accompagnement mensuel." },
  { key: "annualDomain", label: "Domaine par an", unit: "€/an", help: "Renouvellement du ou des domaines." },
  { key: "annualMaintenance", label: "Maintenance par an", unit: "€/an", help: "Maintenance facturée séparément, si applicable." },
  { key: "annualSeo", label: "SEO par an", unit: "€/an", help: "Prestation SEO facturée séparément, si applicable." },
  { key: "annualSupport", label: "Modifications / support par an", unit: "€/an", help: "Budget annuel prévu pour les demandes et le support." },
];

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function formatEuro(value: number) {
  return euro.format(value);
}

function updateAmount(scenario: Scenario, key: keyof Omit<SiteCostInputs, "years">, value: string): Scenario {
  const parsed = Number(value);
  return { ...scenario, [key]: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0 };
}

function ScenarioEditor({ scenario, onChange, id }: { scenario: Scenario; onChange: (next: Scenario) => void; id: string }) {
  return (
    <fieldset className="rounded-md border border-line bg-white p-5">
      <legend className="px-2 font-serif text-2xl text-ink">{scenario.name}</legend>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{scenario.note}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const inputId = `${id}-${field.key}`;
          return (
            <div key={field.key}>
              <label htmlFor={inputId} className="block text-sm font-medium text-ink">{field.label} <span className="text-ink-soft">({field.unit})</span></label>
              <input
                id={inputId}
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={scenario[field.key]}
                onChange={(event) => onChange(updateAmount(scenario, field.key, event.target.value))}
                className="mt-2 min-h-11 w-full rounded-sm border border-line bg-bg px-3 py-2 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <p className="mt-1 text-xs leading-5 text-ink-soft">{field.help}</p>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SiteCostCalculator() {
  const [years, setYears] = useState<SiteCostInputs["years"]>(3);
  const [scenarioA, setScenarioA] = useState<Scenario>({ ...presets.feaseweb });
  const [scenarioB, setScenarioB] = useState<Scenario>({ ...presets.diy });
  const [copied, setCopied] = useState(false);
  const resultA = useMemo(() => calculateSiteCost({ ...scenarioA, years }), [scenarioA, years]);
  const resultB = useMemo(() => calculateSiteCost({ ...scenarioB, years }), [scenarioB, years]);
  const comparison = compareSiteCosts(resultA, resultB);

  function applyPreset(target: "a" | "b", key: string) {
    const preset = presets[key];
    if (!preset) return;
    const next = { ...preset, years };
    if (target === "a") setScenarioA(next);
    else setScenarioB(next);
  }

  async function copyResult() {
    const summary = [
      `Coût total sur ${years} an${years > 1 ? "s" : ""} : ${formatEuro(resultA.total)}`,
      `Création initiale : ${formatEuro(resultA.initialCost)}`,
      `Coûts récurrents : ${formatEuro(resultA.recurringCost)}`,
      `Coût moyen mensuel : ${formatEuro(resultA.averageMonthly)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-10">
      <section className="rounded-lg border border-line bg-bg-alt p-5 md:p-8" aria-labelledby="calculateur-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-dark">Outil gratuit</p>
            <h2 id="calculateur-heading" className="mt-2 font-serif text-3xl text-ink">Calculez votre coût total</h2>
          </div>
          <div>
            <label htmlFor="calculator-duration" className="block text-sm font-medium text-ink">Durée de projection</label>
            <select id="calculator-duration" value={years} onChange={(event) => setYears(Number(event.target.value) as SiteCostInputs["years"])} className="mt-2 min-h-11 rounded-sm border border-line bg-white px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20">
              {DURATIONS.map((duration) => <option key={duration} value={duration}>{duration} an{duration > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">Les scénarios DIY, freelance et agence sont volontairement à compléter : il n’existe pas un prix unique valable pour toutes les situations. Saisissez les valeurs d’un devis ou de l’outil que vous étudiez.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="preset-a" className="text-sm font-medium text-ink">Scénario A</label>
              <select id="preset-a" defaultValue="feaseweb" onChange={(event) => applyPreset("a", event.target.value)} className="min-h-10 rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20">
                <option value="feaseweb">FeaseWeb</option><option value="diy">DIY / plateforme</option><option value="freelance">Freelance</option><option value="agency">Agence</option><option value="managed">Service géré</option>
              </select>
            </div>
            <ScenarioEditor scenario={scenarioA} onChange={setScenarioA} id="scenario-a" />
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="preset-b" className="text-sm font-medium text-ink">Scénario B</label>
              <select id="preset-b" defaultValue="diy" onChange={(event) => applyPreset("b", event.target.value)} className="min-h-10 rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20">
                <option value="diy">DIY / plateforme</option><option value="freelance">Freelance</option><option value="agency">Agence</option><option value="managed">Service géré</option><option value="feaseweb">FeaseWeb</option>
              </select>
            </div>
            <ScenarioEditor scenario={scenarioB} onChange={setScenarioB} id="scenario-b" />
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="calculator-results-heading" aria-live="polite">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-medium text-brand-dark">Résultat</p><h2 id="calculator-results-heading" className="mt-2 font-serif text-3xl text-ink">Sur {years} an{years > 1 ? "s" : ""}</h2></div>
          <button type="button" onClick={copyResult} className="min-h-11 rounded-sm border border-brand px-4 py-2 text-sm font-medium text-brand-dark hover:bg-bg-alt focus:outline-none focus:ring-2 focus:ring-brand/30">{copied ? "Résultat copié" : "Copier le résultat"}</button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[{ label: scenarioA.name, result: resultA }, { label: scenarioB.name, result: resultB }].map(({ label, result }) => (
            <div key={label} className="rounded-md border border-line bg-white p-5"><p className="text-sm text-ink-soft">{label}</p><p className="mt-2 font-serif text-4xl text-ink">{formatEuro(result.total)}</p><p className="mt-1 text-sm text-ink-soft">{formatEuro(result.averageMonthly)} en moyenne par mois</p><dl className="mt-5 grid gap-2 border-t border-line pt-4 text-sm text-ink-soft"><div className="flex justify-between gap-4"><dt>Année 1</dt><dd className="font-medium text-ink">{formatEuro(result.yearOne)}</dd></div><div className="flex justify-between gap-4"><dt>Années suivantes</dt><dd className="font-medium text-ink">{formatEuro(result.followingYears)} / an</dd></div><div className="flex justify-between gap-4"><dt>Création initiale</dt><dd className="font-medium text-ink">{formatEuro(result.initialCost)}</dd></div><div className="flex justify-between gap-4"><dt>Récurrent</dt><dd className="font-medium text-ink">{formatEuro(result.recurringCost)}</dd></div></dl></div>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-line bg-bg-alt p-5 text-sm text-ink-soft"><p><strong className="text-ink">Écart entre les scénarios :</strong> {formatEuro(comparison.difference)} ({percent.format(comparison.percentage)} % de la valeur la plus élevée).</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><p>Scénario A : {percent.format(resultA.initialShare)} % initial / {percent.format(resultA.recurringShare)} % récurrent</p><p>Scénario B : {percent.format(resultB.initialShare)} % initial / {percent.format(resultB.recurringShare)} % récurrent</p></div></div>
        <div className="mt-4 overflow-x-auto rounded-md border border-line bg-white"><table className="min-w-full text-left text-sm"><caption className="sr-only">Détail du coût cumulé par année</caption><thead className="border-b border-line bg-bg-alt"><tr><th scope="col" className="px-4 py-3 font-medium">Année</th><th scope="col" className="px-4 py-3 font-medium">{scenarioA.name}</th><th scope="col" className="px-4 py-3 font-medium">{scenarioB.name}</th></tr></thead><tbody className="divide-y divide-line text-ink-soft">{Array.from({ length: years }, (_, index) => <tr key={index}><th scope="row" className="px-4 py-3 font-medium text-ink">{index + 1}</th><td className="px-4 py-3">{formatEuro(resultA.annualTotals[index])}</td><td className="px-4 py-3">{formatEuro(resultB.annualTotals[index])}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
