import { useEffect, useRef } from "react";

import { twMerge, log } from "lib/utils";

import {
  DEFAULT_LABELS,
  DEFAULT_TILE_URL,
  DEFAULT_TILE_ATTRIBUTION,
  DEFAULT_REVERSE_GEOCODE_URL,
  propTypes,
} from "./props";

// Pinned to the installed leaflet version so the CDN stylesheet matches the
// runtime. Bump both together when upgrading leaflet.
const LEAFLET_VERSION = "1.9.4";
const LEAFLET_CSS_ID = "leaflet-css";

// Leaflet is kept external + lazy-loaded, so its stylesheet is not bundled
// into smartcommon's CSS. Inject it once from the CDN at runtime. The map
// already requires network access for the OSM tiles, so an online-only
// stylesheet is consistent with the component's nature.
const ensureLeafletCss = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(LEAFLET_CSS_ID)) return;
  const link = document.createElement("link");
  link.id = LEAFLET_CSS_ID;
  link.rel = "stylesheet";
  link.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
  document.head.appendChild(link);
};

// Dependency-free marker icon (inline SVG) so the component never relies on
// Leaflet's PNG assets, which break under bundlers / external resolution.
const buildMarkerIcon = (L) =>
  L.divIcon({
    className: "",
    html:
      '<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M13 0C5.8 0 0 5.8 0 13c0 9.7 13 25 13 25s13-15.3 13-25C26 5.8 20.2 0 13 0z" fill="#f72d40"/>' +
      '<circle cx="13" cy="13" r="5" fill="#ffffff"/></svg>',
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -34],
  });

const formatAddress = (address, fallback) => {
  const line = [
    address.road,
    address.postcode,
    address.city || address.village,
    address.state,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
  return line || fallback;
};

/**
 * Leaflet map (core-only build).
 *
 * Renders a base tile map for every `type`. When `type === "search"`, a click
 * drops a marker and reverse-geocodes the point. The `type === "route"` mode
 * needs the leaflet-routing-machine plugin, which is intentionally not bundled;
 * it degrades to the base map and logs a warning.
 *
 * Leaflet is loaded lazily (dynamic import) and kept external to the library
 * bundle, so it only reaches a consumer's build - as a lazy chunk - when <Map>
 * is actually used.
 *
 * @param {object} props
 * @param {"search"|"route"} [props.type]
 * @param {[number, number]} [props.center]
 * @param {number} [props.zoom]
 * @param {function} [props.onChange] - Called with { lat, lng, address } after
 *   a successful reverse-geocode in "search" mode.
 */
export const Map = (props) => {
  const {
    type,
    center = [46.6031, 1.8883],
    zoom = 5,
    tileUrl = DEFAULT_TILE_URL,
    tileAttribution = DEFAULT_TILE_ATTRIBUTION,
    reverseGeocodeUrl = DEFAULT_REVERSE_GEOCODE_URL,
    onChange,
    className,
  } = props;
  const labels = { ...DEFAULT_LABELS, ...(props.labels ?? {}) };

  const containerRef = useRef(null);
  // Keep the latest callbacks/labels reachable from the effect without
  // re-initialising the map on every render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  useEffect(() => {
    let map;
    let cancelled = false;

    ensureLeafletCss();

    import("leaflet")
      .then(({ default: L }) => {
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current).setView(center, zoom);
        L.tileLayer(tileUrl, { attribution: tileAttribution }).addTo(map);

        if (type === "search") {
          let marker;
          map.on("click", async (e) => {
            const { lat, lng } = e.latlng;
            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng], { icon: buildMarkerIcon(L) }).addTo(map);
            try {
              const res = await fetch(
                `${reverseGeocodeUrl}?lat=${lat}&lon=${lng}&format=json`,
                { signal: AbortSignal.timeout(8000) }
              );
              if (!res.ok) {
                throw new Error(`Map: reverse geocode HTTP ${res.status}`);
              }
              const data = await res.json();
              const address = data?.address;
              if (!address) {
                log.warning("Map: reverse geocoding returned no address", { lat, lng });
                marker.bindPopup(labelsRef.current.noResults).openPopup();
                return;
              }
              marker
                .bindPopup(formatAddress(address, labelsRef.current.noResults))
                .openPopup();
              onChangeRef.current?.({ lat, lng, address });
            } catch (err) {
              log.error("Map: reverse geocoding failed", err);
            }
          });
        } else if (type === "route") {
          // leaflet-routing-machine is not bundled in this core-only build.
          // Keep the base map and tell the developer how to enable routing.
          log.warning(
            "Map: type='route' requires the leaflet-routing-machine plugin, " +
            "which is not bundled in smartcommon (core-only Leaflet)."
          );
        }

        // Leaflet measures the container at init; if the layout settled after
        // init (hidden parent, late sizing), force a resize next frame.
        requestAnimationFrame(() => { if (!cancelled) map?.invalidateSize(); });
      })
      .catch((err) => {
        log.error("Map: failed to load Leaflet", err);
      });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
    // center/zoom are init-only on purpose: a new array literal each render
    // would otherwise tear down and rebuild the map continuously.
  }, [type, tileUrl, tileAttribution, reverseGeocodeUrl]);

  return (
    <div
      ref={containerRef}
      data-component="Map"
      className={twMerge("w-full h-full min-h-[400px] text-black z-10", className)}
    />
  );
};

Map.propTypes = propTypes;
