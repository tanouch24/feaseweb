import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminOverview, ProspectsPage } from "@/components/admin/AdminApp";
import { BackofficeProvider } from "@/lib/backoffice-store";
import { demoData } from "@/lib/backoffice";

function renderAdmin(node: React.ReactNode) { return render(<BackofficeProvider>{node}</BackofficeProvider>); }

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ data: { prospects: [], clients: [], sites: [], subscriptions: [], payments: [], requests: [], seoActions: [], seoMetrics: [], domains: [], activity: [] } }) })));
});

describe("back-office local console", () => {
  it("does not present fictional metrics when the dataset is empty", async () => {
    renderAdmin(<AdminOverview />);
    await waitFor(() => expect(screen.getByText("MRR réel").parentElement).toHaveTextContent("0 €"));
    expect(screen.getByText("Aucune activité")).toBeInTheDocument();
    expect(screen.getByText(/Aucune donnée locale n'est utilisée/)).toBeInTheDocument();
  });

  it("does not read localStorage for business data", async () => {
    window.localStorage.setItem("feaseweb-backoffice-v1", JSON.stringify(demoData()));
    renderAdmin(<AdminOverview />);
    await waitFor(() => expect(screen.getByText("MRR réel").parentElement).toHaveTextContent("0 €"));
  });

  it("filters prospects by company or email", async () => {
    const remoteData = demoData();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ data: remoteData }) })));
    renderAdmin(<ProspectsPage />);
    const input = screen.getByRole("textbox", { name: "Rechercher un prospect" });
    await userEvent.type(input, "atelier");
    expect(screen.getByText("Atelier Martin")).toBeInTheDocument();
    expect(screen.queryByText("Studio Nora")).not.toBeInTheDocument();
  });
});
