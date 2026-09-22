import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CommentCaMarchePage from "@/app/comment-ca-marche/page";
import TarifsPage from "@/app/tarifs/page";
import FAQPage from "@/app/faq/page";
import SEOPage from "@/app/seo/page";
import HomePage from "@/app/page";

describe("CommentCaMarchePage", () => {
  it("renders the process steps and the comparison block", () => {
    render(<CommentCaMarchePage />);
    expect(screen.getByText("Parlez-nous de votre entreprise")).toBeInTheDocument();
    expect(
      screen.getByText("Vous ne construisez rien. FeaseWeb le fait pour vous.")
    ).toBeInTheDocument();
  });
});

describe("TarifsPage", () => {
  it("shows the 0€/49€ pricing and the included services", () => {
    render(<TarifsPage />);
    expect(screen.getByText("0 €")).toBeInTheDocument();
    expect(screen.getByText("49 €")).toBeInTheDocument();
    expect(screen.getByText("Création")).toBeInTheDocument();
  });
});

describe("FAQPage", () => {
  it("renders the FAQ accordion", () => {
    render(<FAQPage />);
    expect(
      screen.getByRole("button", { name: /Pourquoi la création est-elle à 0 €/ })
    ).toBeInTheDocument();
  });
});

describe("SEOPage", () => {
  it("never promises a guaranteed ranking", () => {
    render(<SEOPage />);
    expect(
      screen.queryByText(/première position|garanti/i)
    ).not.toBeInTheDocument();
  });
});

describe("HomePage", () => {
  it("links out to every dedicated page", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: /Comment ça marche/ })).toHaveAttribute(
      "href",
      "/comment-ca-marche"
    );
    expect(screen.getByRole("link", { name: /^Tarif/ })).toHaveAttribute(
      "href",
      "/tarifs"
    );
    expect(screen.getByRole("link", { name: /^Blog/ })).toHaveAttribute(
      "href",
      "/blog"
    );
  });
});
