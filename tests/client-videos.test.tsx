import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientVideos } from "@/components/home/ClientVideos";
import { clientVideos } from "@/lib/client-videos";

describe("ClientVideos", () => {
  it("renders nothing while there is no real client video", () => {
    const { container } = render(<ClientVideos videos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows each client with their trade, city and quote", () => {
    render(
      <ClientVideos
        videos={[
          {
            name: "Marc",
            trade: "Plombier",
            city: "Lyon",
            quote: "Je n'ai rien eu à faire.",
            src: "/videos/clients/marc.mp4",
            poster: "/videos/clients/marc.jpg",
          },
        ]}
      />
    );
    expect(screen.getByText("Plombier, Lyon")).toBeInTheDocument();
    expect(screen.getByText(/Je n'ai rien eu à faire/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lire la vidéo de Marc/ })).toBeInTheDocument();
  });

  it("ships without placeholder testimonials", () => {
    expect(clientVideos).toEqual([]);
  });
});
