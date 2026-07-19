"use client";

import { Search, SlidersHorizontal, Eye, X, MessageSquare, ExternalLink, MapPin, Briefcase } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { discoverInvestors } from "@/lib/api/investor-discovery";
import { VerificationBadges } from "@/features/profile-verification/verification-badges";
import type {
  InvestorDiscoveryItem,
  InvestorDiscoveryParams
} from "@/lib/api/investor-discovery";

const PAGE_SIZE = 12;

export function InvestorDiscoveryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState("");
  const [ticketMin, setTicketMin] = useState("");
  const [ticketMax, setTicketMax] = useState("");
  const [items, setItems] = useState<InvestorDiscoveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorDiscoveryItem | null>(null);

  async function loadInvestors(
    nextOffset = 0,
    overrides?: Partial<InvestorDiscoveryParams>
  ) {
    setIsLoading(true);
    setError("");

    const params: InvestorDiscoveryParams = {
      limit: PAGE_SIZE,
      offset: nextOffset
    };

    if (query.trim()) {
      params.query = query.trim();
    }

    if (organization.trim()) {
      params.organization = organization.trim();
    }

    if (ticketMin) {
      params.ticket_min = ticketMin;
    }

    if (ticketMax) {
      params.ticket_max = ticketMax;
    }

    Object.assign(params, overrides);

    try {
      const response = await discoverInvestors(params);
      setItems(response.items);
      setTotal(response.total);
      setOffset(response.offset);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to load investors."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInvestors();
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadInvestors();
  }

  function clearFilters() {
    setQuery("");
    setOrganization("");
    setTicketMin("");
    setTicketMax("");
    setOffset(0);
    loadInvestors(0, {
      query: undefined,
      organization: undefined,
      ticket_min: undefined,
      ticket_max: undefined
    });
  }

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);
  const canGoBack = offset > 0;
  const canGoForward = offset + PAGE_SIZE < total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Capital Network
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Explore Investors</h1>
        </div>
        <div className="text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-white font-semibold">{total}</span> investors listed
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-white/10 bg-zinc-950/50 backdrop-blur-md">
        <CardHeader className="py-4 border-b border-white/5">
          <CardTitle className="flex items-center text-sm font-semibold text-white">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="grid gap-4 md:grid-cols-4" onSubmit={onSubmit}>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="query" className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary h-10"
                  id="query"
                  maxLength={255}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Investor name, keywords, thesis"
                  value={query}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="organization" className="text-xs text-muted-foreground">Organization</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary h-10"
                id="organization"
                maxLength={255}
                onChange={(event) => setOrganization(event.target.value)}
                placeholder="e.g. Acme Ventures"
                value={organization}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="ticketMin" className="text-xs text-muted-foreground">Min Ticket</Label>
                <MoneyInput
                  id="ticketMin"
                  onChange={(val) => setTicketMin(val)}
                  value={ticketMin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ticketMax" className="text-xs text-muted-foreground">Max Ticket</Label>
                <MoneyInput
                  id="ticketMax"
                  onChange={(val) => setTicketMax(val)}
                  value={ticketMax}
                />
              </div>
            </div>
            <div className="flex gap-2 md:col-span-4 pt-2">
              <Button className="bg-primary hover:bg-primary/90 text-black font-semibold h-9 px-5" disabled={isLoading} type="submit">
                Apply Filters
              </Button>
              <Button className="border-white/10 hover:bg-white/5 text-white h-9 px-5" disabled={isLoading} onClick={clearFilters} type="button" variant="outline">
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <Alert>{error}</Alert> : null}

      {/* Explore Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="aspect-square animate-pulse rounded-lg bg-white/5 border border-white/10" key={index} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {items.map((investor) => (
            <div
              key={investor.id}
              onClick={() => setSelectedInvestor(investor)}
              className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-neutral-950 cursor-pointer group transition-all duration-300 hover:border-primary/40"
            >
              {/* Media preview (Gradient with initials) */}
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-sky-950/20 to-black">
                <div className="flex flex-col items-center p-4 text-center">
                  <span className="text-2xl font-bold text-white/40 group-hover:scale-105 transition-transform">
                    {investor.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">
                    {investor.organization || "Independent"}
                  </span>
                </div>
              </div>

              {/* Instagram-style Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 text-white p-3 text-center">
                <span className="font-bold text-sm truncate w-full">{investor.name}</span>
                <span className="text-[10px] text-primary font-semibold tracking-wider uppercase">
                  {formatCurrency(investor.ticket_size)} TICKET
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">
                  {investor.organization || "Angel Investor"}
                </span>
                <Eye className="h-5 w-5 text-white/80 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground bg-zinc-950 rounded-lg border border-white/10">
          No investors found matching your criteria.
        </div>
      )}

      {/* Pagination Bar */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-muted-foreground">
          <span>
            Showing {pageStart}-{pageEnd} of {total}
          </span>
          <div className="flex gap-2">
            <Button
              className="hover:bg-white/5 text-white"
              disabled={!canGoBack || isLoading}
              onClick={() => loadInvestors(Math.max(offset - PAGE_SIZE, 0))}
              size="sm"
              variant="ghost"
            >
              Previous
            </Button>
            <Button
              className="hover:bg-white/5 text-white"
              disabled={!canGoForward || isLoading}
              onClick={() => loadInvestors(offset + PAGE_SIZE)}
              size="sm"
              variant="ghost"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Instagram Post Detail Modal Overlay */}
      {selectedInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[90vh]">
            <button
              onClick={() => setSelectedInvestor(null)}
              className="absolute right-4 top-4 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Information Pane */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[85vh] space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-purple-600 font-bold text-white text-sm">
                    {selectedInvestor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xl font-bold text-white">{selectedInvestor.name}</h2>
                      <VerificationBadges badges={selectedInvestor.verification_badges} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selectedInvestor.organization || "Independent Angel"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Thesis */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Investment Thesis</h4>
                <p className="text-sm leading-relaxed text-white bg-white/5 p-4 rounded-lg">
                  {selectedInvestor.investment_thesis || "No thesis provided yet."}
                </p>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/5 p-3 rounded-lg">
                  <span className="text-muted-foreground block">Typical Ticket Size</span>
                  <span className="font-semibold text-white mt-0.5 block text-sm">
                    {formatCurrency(selectedInvestor.ticket_size)}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <span className="text-muted-foreground block">Verification Badges</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedInvestor.verification_badges.length > 0 ? (
                      selectedInvestor.verification_badges.map((b) => (
                        <Badge key={b} className="bg-primary/10 text-primary border-primary/25 text-[10px]">
                          {b}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-[10px]">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <Button
                  onClick={() => {
                    router.push("/messages");
                    setSelectedInvestor(null);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold h-10"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Message Investor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}
