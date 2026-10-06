"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { localityCoordinates } from "@/lib/canil/locality-coordinates";

type MapShelter = {
  id: string;
  nome: string;
  localizacao: string;
  animals: number;
  href: string;
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/**
 * "Explore on the map" section shown after the shelter list. OpenStreetMap tiles load
 * only once the section scrolls near the viewport.
 */
export function ShelterDirectoryMap({
  shelters,
  locale,
}: {
  shelters: MapShelter[];
  locale: string;
}) {
  const pt = locale === "pt";
  const [open, setOpen] = useState(false);
  const section = useRef<HTMLElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const placed = shelters
    .map((s) => ({ ...s, coords: localityCoordinates(s.localizacao) }))
    .filter((s): s is MapShelter & { coords: [number, number] } =>
      Boolean(s.coords),
    );
  const missing = shelters.length - placed.length;
  const key = placed.map((s) => s.id).join(",");

  useEffect(() => {
    if (open || !section.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOpen(true);
      },
      { rootMargin: "300px" },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open || !container.current) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const seen = new Map<string, number>();
      const points: [number, number][] = [];
      for (const s of placed) {
        // Fan out shelters that share a town so every pin stays clickable.
        const n = seen.get(s.coords.join()) ?? 0;
        seen.set(s.coords.join(), n + 1);
        const angle = n * 2.4;
        const point: [number, number] = [
          s.coords[0] + (n ? 0.012 * Math.cos(angle) : 0),
          s.coords[1] + (n ? 0.016 * Math.sin(angle) : 0),
        ];
        points.push(point);
        const icon = L.divIcon({
          className: "",
          html: `<span class="shelter-pin"><span>${s.animals}</span></span>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -34],
        });
        L.marker(point, { icon, title: s.nome })
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(s.nome)}</strong><br>${escapeHtml(s.localizacao)}<br>` +
              `${s.animals} ${pt ? (s.animals === 1 ? "animal" : "animais") : s.animals === 1 ? "animal" : "animals"}<br>` +
              `<a href="${escapeHtml(s.href)}">${pt ? "Conhecer o abrigo" : "Visit shelter"} →</a>`,
          );
      }
      if (points.length > 1)
        map.fitBounds(points, { padding: [40, 40], maxZoom: 11 });
      else map.setView(points[0] ?? [39.6, -8.0], points.length ? 11 : 6);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
    // `key` captures the visible shelters; `placed` is derived from it each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, key, pt]);

  if (placed.length === 0) return null;

  return (
    <section
      ref={section}
      id="mapa"
      aria-labelledby="directory-map-title"
      className="mt-12 scroll-mt-24"
    >
      <h2 id="directory-map-title" className="display-title mb-4 text-2xl">
        {pt ? "Explorar no mapa" : "Explore on the map"}
      </h2>
      <div className="overflow-hidden rounded-3xl border border-border bg-muted">
        <div
          ref={container}
          className="h-[22rem] w-full sm:h-[28rem]"
          aria-label={pt ? "Mapa dos abrigos" : "Shelter map"}
        />
        <p className="border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
          {pt
            ? "Cada pin marca a localidade do abrigo, não a morada exata. O número é o de animais para adoção."
            : "Each pin marks the shelter's town, not its exact address. The number shows animals for adoption."}
          {missing > 0 &&
            (pt
              ? ` ${missing} ${missing === 1 ? "abrigo não aparece" : "abrigos não aparecem"} por a localidade não ser reconhecida.`
              : ` ${missing} ${missing === 1 ? "shelter is" : "shelters are"} not shown because the town was not recognised.`)}
        </p>
      </div>
    </section>
  );
}
