import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminOverview, ProspectsPage } from "@/components/admin/AdminApp";
import { BackofficeProvider } from "@/lib/backoffice-store";
import { demoData } from "@/lib/backoffice";

function renderAdmin(node: React.ReactNode) { return render(<BackofficeProvider>{node}</BackofficeProvider>); }

beforeEach(() => window.localStorage.clear());

describe("back-office local console", () => {
  it("does not present fictional metrics when the dataset is empty", () => {
    renderAdmin(<AdminOverview />);
    expect(screen.getByText("MRR réel").parentElement).toHaveTextContent("0 €");
    expect(screen.getByText("Aucune activité")).toBeInTheDocument();
    expect(screen.getByText(/Aucune donnée réelle n'est connectée/)).toBeInTheDocument();
  });

  it("loads explicitly marked demo data only after the operator asks", async () => {
    renderAdmin(<AdminOverview />);
    await userEvent.click(screen.getByRole("button", { name: /Charger les données de démonstration/ }));
    expect(screen.getByText(/49/)).toBeInTheDocument();
    expect(screen.getByText("Client de démonstration créé.")).toBeInTheDocument();
  });

  it("filters prospects by company or email", async () => {
    window.localStorage.setItem("feaseweb-backoffice-v1", JSON.stringify(demoData()));
    renderAdmin(<ProspectsPage />);
    const input = screen.getByRole("textbox", { name: "Rechercher un prospect" });
    await userEvent.type(input, "atelier");
    expect(screen.getByText("Atelier Martin")).toBeInTheDocument();
    expect(screen.queryByText("Studio Nora")).not.toBeInTheDocument();
  });
});
