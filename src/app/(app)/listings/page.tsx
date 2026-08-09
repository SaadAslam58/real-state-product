import Image from "next/image";
import type { Metadata } from "next";
import { getAgency, getListings } from "@/lib/data";
import { parseScenario } from "@/lib/data/scenarios";
import { LISTING_STATUS_LABEL } from "@/lib/status";
import {
  Card,
  CardList,
  EmptyState,
  ErrorSurface,
  Mono,
  Pagination,
  Table,
  TableShell,
  Td,
  Th,
  ButtonLink,
} from "@/components/ui/Primitives";
import { SourceTag, sourceSpineStyle } from "@/components/status/Status";
import { SearchBox, FilterSelect, ClearFilters } from "@/components/ui/Interactive";
import { SyncBar, AddListingButton, ListingRowActions } from "./ListingControls";
import { formatPrice, formatRelative, formatSpec } from "@/lib/format";
import { isDataError, type ListingSource, type ListingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Listings" };

const FILTER_KEYS = ["source", "status", "q"];

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const scenario = parseScenario(sp.scenario);
  const now = new Date();

  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const hasFilters = FILTER_KEYS.some((k) => {
    const v = one(k);
    return v && v !== "all";
  });

  const qs = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const k of [...FILTER_KEYS, "scenario"]) {
      const v = one(k);
      if (v && v !== "all") p.set(k, v);
    }
    for (const [k, v] of Object.entries(patch)) p.set(k, String(v));
    return `/listings${p.toString() ? `?${p}` : ""}`;
  };

  const agency = await getAgency(scenario).catch(() => null);

  let body: React.ReactNode;
  try {
    const page = await getListings(
      {
        source: (one("source") ?? "all") as ListingSource | "all",
        status: (one("status") ?? "all") as ListingStatus | "all",
        search: one("q") ?? "",
        page: Number(one("page") ?? 1) || 1,
      },
      scenario,
    );

    if (page.items.length === 0) {
      body = (
        <Card>
          {hasFilters ? (
            <EmptyState
              variant="no-match"
              title="No listings match these filters"
              body="Try a different source or status, or clear the search."
              action={<ButtonLink href="/listings" size="sm">Clear all filters</ButtonLink>}
            />
          ) : (
            <EmptyState
              variant="no-data"
              title="No listings yet"
              body="The AI can only talk about properties it knows. Pull your portfolio in from Bayut and Property Finder, or add a property by hand to get started right now."
              action={
                <span className="flex flex-wrap gap-2 justify-center">
                  <SyncBar
                    status={agency?.sync.status ?? "never"}
                    attemptedAt={agency?.sync.attemptedAt ?? null}
                    succeededAt={agency?.sync.succeededAt ?? null}
                    imported={agency?.sync.imported ?? 0}
                    failed={agency?.sync.failed ?? 0}
                    message={agency?.sync.message ?? null}
                    compact
                  />
                  <AddListingButton />
                </span>
              }
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9.5 21v-6h5v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              }
            />
          )}
        </Card>
      );
    } else {
      body = (
        <TableShell>
          <Table>
            <thead>
              <tr>
                <Th className="w-[92px]">Photo</Th>
                <Th>Property</Th>
                <Th align="right">Price</Th>
                <Th>Beds / baths</Th>
                <Th>Source</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((l) => (
                <tr
                  key={l.id}
                  className="relative border-b border-hairline last:border-0 hover:bg-sunk/60 transition-colors"
                >
                  <Td className="relative">
                    {/* Source gets a coloured spine on the row, not just a label.
                        A synced listing is overwritten on the next sync, so
                        editing one loses your edit — that changes what the user
                        is allowed to do and deserves more than small text. */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={sourceSpineStyle(l.source)}
                    />
                    <span className="block relative w-16 h-12 rounded-md overflow-hidden bg-sunk ml-1">
                      <Image
                        src={l.photos[0] ?? ""}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                  </Td>

                  <Td>
                    <span className="block font-semibold text-ink truncate-1 max-w-[30ch]">
                      {l.title}
                    </span>
                    <span className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted">{l.area}</span>
                      <Mono>{l.reference}</Mono>
                    </span>
                  </Td>

                  <Td align="right">
                    <span className="font-semibold text-ink whitespace-nowrap">
                      {formatPrice(l.priceAED, l.pricePeriod)}
                    </span>
                  </Td>

                  <Td>
                    <span className="text-xs whitespace-nowrap">
                      {l.beds === 0 ? "Studio" : `${l.beds} bed`} · {l.baths} bath
                    </span>
                  </Td>

                  <Td>
                    <SourceTag source={l.source} />
                  </Td>

                  <Td>
                    <span className="text-xs capitalize">{LISTING_STATUS_LABEL[l.status]}</span>
                  </Td>

                  <Td align="right">
                    <ListingRowActions id={l.id} title={l.title} source={l.source} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <CardList>
            {page.items.map((l) => (
              <li key={l.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={sourceSpineStyle(l.source)}
                />
                <div className="flex gap-3 pl-5 pr-4 py-3.5">
                  <span className="relative w-[72px] h-[54px] rounded-md overflow-hidden bg-sunk shrink-0">
                    <Image src={l.photos[0] ?? ""} alt="" fill sizes="72px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-ink truncate-1">{l.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {formatSpec(l.beds, l.baths, l.sizeSqft)}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="font-semibold text-sm text-ink">
                        {formatPrice(l.priceAED, l.pricePeriod)}
                      </span>
                      <SourceTag source={l.source} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </CardList>

          <Pagination
            page={page.page}
            pageSize={page.pageSize}
            total={page.total}
            hrefFor={(p) => qs({ page: p })}
          />
        </TableShell>
      );
    }
  } catch (e) {
    body = (
      <Card>
        <ErrorSurface
          title="Couldn't load your listings"
          body={isDataError(e) ? e.message : "Something went wrong on our side."}
          retryHref="/listings"
        />
      </Card>
    );
  }

  return (
    <div className="max-w-[1180px] mx-auto flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="t-eyebrow mb-1.5">What the AI can talk about</p>
          <h1 className="t-display text-xl text-ink">Listings</h1>
        </div>
        <div className="flex items-center gap-2">
          <SyncBar
            status={agency?.sync.status ?? "never"}
            attemptedAt={agency?.sync.attemptedAt ?? null}
            succeededAt={agency?.sync.succeededAt ?? null}
            imported={agency?.sync.imported ?? 0}
            failed={agency?.sync.failed ?? 0}
            message={agency?.sync.message ?? null}
          />
          <AddListingButton />
        </div>
      </div>

      {/* Sync outcome, when it is not a plain success. "Last synced 09:00" hides a
          14:20 failure, which is exactly when the agency needs to know. */}
      {agency && agency.sync.status !== "ok" && agency.sync.status !== "never" ? (
        <SyncNotice
          status={agency.sync.status}
          message={agency.sync.message}
          imported={agency.sync.imported}
          failed={agency.sync.failed}
          succeededAt={agency.sync.succeededAt}
          now={now}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox placeholder="Search reference, area, or address" />
        <FilterSelect
          paramKey="source"
          label="Filter by source"
          options={[
            { value: "all", label: "All sources" },
            { value: "synced", label: "Synced from portals" },
            { value: "manual", label: "Added manually" },
          ]}
        />
        <FilterSelect
          paramKey="status"
          label="Filter by status"
          options={[
            { value: "all", label: "Any status" },
            { value: "available", label: "Available" },
            { value: "reserved", label: "Reserved" },
            { value: "let", label: "Let" },
            { value: "sold", label: "Sold" },
          ]}
        />
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      {body}
    </div>
  );
}

function SyncNotice({
  status,
  message,
  imported,
  failed,
  succeededAt,
  now,
}: {
  status: "partial" | "failed" | "empty";
  message: string | null;
  imported: number;
  failed: number;
  succeededAt: string | null;
  now: Date;
}) {
  const copy = {
    partial: {
      title: `${imported} listings imported, ${failed} failed`,
      body:
        message ??
        "Some listings couldn't be read from the portal. The ones that failed are unchanged from the last successful sync.",
    },
    failed: {
      title: "Last sync failed",
      body: `${
        succeededAt
          ? `Listings below are from the last successful sync, ${formatRelative(succeededAt, now)} ago.`
          : "No successful sync yet."
      } ${message ?? ""}`.trim(),
    },
    empty: {
      title: "Sync returned no listings",
      body:
        // An empty sync must never wipe a non-empty catalogue — that would take
        // the agency's whole portfolio away from the AI with no explanation.
        "Your existing listings have been kept. This usually means the portal account changed or the feed is temporarily unavailable.",
    },
  }[status];

  return (
    <div
      className="flex items-start gap-3 rounded-lg border px-4 py-3"
      style={{
        background: "var(--color-ember-tint)",
        borderColor: "var(--color-ember-border)",
      }}
      role="status"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
        style={{ background: "var(--color-ember)" }}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: "#8a3a10" }}>
          {copy.title}
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#96513a" }}>
          {copy.body}
        </p>
      </div>
    </div>
  );
}
