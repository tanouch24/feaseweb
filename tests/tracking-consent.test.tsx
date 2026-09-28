import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrackingConsent } from "@/components/analytics/TrackingConsent";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("tracking consent UI", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "feaseweb_consent=; Max-Age=0; Path=/";
  });

  it("saves both choices, closes the dialog and confirms the save", async () => {
    const user = userEvent.setup();
    render(<TrackingConsent />);

    await user.click(screen.getByRole("button", { name: "Choisir" }));
    await user.click(screen.getByRole("checkbox", { name: /Mesure d’audience/ }));
    await user.click(screen.getByRole("checkbox", { name: /Marketing/ }));
    await user.click(screen.getByRole("button", { name: "Enregistrer mes choix" }));

    expect(JSON.parse(window.localStorage.getItem("feaseweb-consent") ?? "null")).toEqual({ analytics: true, marketing: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Vos préférences ont été enregistrées.");
  });

  it("restores the saved choices when preferences are reopened", async () => {
    window.localStorage.setItem("feaseweb-consent", JSON.stringify({ analytics: true, marketing: false }));
    const user = userEvent.setup();
    render(<TrackingConsent />);

    await user.click(screen.getByRole("button", { name: "Gérer mes cookies" }));

    expect(screen.getByRole("checkbox", { name: /Mesure d’audience/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Marketing/ })).not.toBeChecked();
  });

  it("dismisses the save confirmation automatically", () => {
    vi.useFakeTimers();
    render(<TrackingConsent />);

    fireEvent.click(screen.getByRole("button", { name: "Tout accepter" }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
