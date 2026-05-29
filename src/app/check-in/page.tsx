"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type FilterMode = "all" | "checked-in" | "not-checked-in";

type GuestRecord = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  status: string;
  plusOnes: string;
  note: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkInCount: number;
  raw: Record<string, string>;
};

type ImportSummary = {
  fileName: string;
  importedAt: string;
  guestCount: number;
};

const STORAGE_KEY = "attentionlabs-launch-check-in-state";
const DEFAULT_CSV_PATH = "/attendance_with_speakers_appended.csv";
const DEFAULT_CSV_NAME = "Attendance_with_speakers_appended.csv";

const FIELD_CANDIDATES = {
  fullName: ["full name", "name", "guest name", "attendee", "attendee name"],
  firstName: ["first name", "firstname", "given name"],
  lastName: ["last name", "lastname", "surname", "family name"],
  email: ["email", "email address", "e-mail"],
  company: ["company", "organization", "employer", "institution"],
  title: ["title", "role", "job title"],
  status: ["status", "rsvp", "rsvp status", "response"],
  plusOnes: ["plus one", "plus ones", "guests", "guest count"],
  note: ["notes", "note", "comments", "comment"],
} as const;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function findField(headers: string[], candidates: readonly string[]) {
  const normalized = headers.map((header) => normalizeHeader(header));
  const index = normalized.findIndex((header) => candidates.includes(header));
  return index >= 0 ? headers[index] : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      const hasContent = row.some((cell) => cell.trim().length > 0);
      if (hasContent) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    const hasContent = row.some((cell) => cell.trim().length > 0);
    if (hasContent) {
      rows.push(row);
    }
  }

  return rows;
}

function serializeCsv(records: GuestRecord[]) {
  const rawHeaders = new Set<string>();
  records.forEach((record) => {
    Object.keys(record.raw).forEach((key) => rawHeaders.add(key));
  });

  const headers = [
    "full_name",
    "first_name",
    "last_name",
    "email",
    "company",
    "title",
    "status",
    "plus_ones",
    "note",
    "checked_in",
    "checked_in_at",
    "check_in_count",
    ...Array.from(rawHeaders),
  ];

  const escape = (value: string) => {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [
    headers.join(","),
    ...records.map((record) =>
      headers
        .map((header) => {
          const valueMap: Record<string, string> = {
            full_name: record.fullName,
            first_name: record.firstName,
            last_name: record.lastName,
            email: record.email,
            company: record.company,
            title: record.title,
            status: record.status,
            plus_ones: record.plusOnes,
            note: record.note,
            checked_in: record.checkedIn ? "yes" : "no",
            checked_in_at: record.checkedInAt ?? "",
            check_in_count: String(record.checkInCount),
          };

          return escape(valueMap[header] ?? record.raw[header] ?? "");
        })
        .join(","),
    ),
  ].join("\n");
}

function buildGuestRecords(rows: string[][]) {
  if (rows.length < 2) {
    throw new Error("The CSV needs a header row and at least one guest.");
  }

  const headers = rows[0].map((header, index) =>
    header.trim() || `column_${index + 1}`,
  );

  const fullNameHeader = findField(headers, FIELD_CANDIDATES.fullName);
  const firstNameHeader = findField(headers, FIELD_CANDIDATES.firstName);
  const lastNameHeader = findField(headers, FIELD_CANDIDATES.lastName);
  const emailHeader = findField(headers, FIELD_CANDIDATES.email);
  const companyHeader = findField(headers, FIELD_CANDIDATES.company);
  const titleHeader = findField(headers, FIELD_CANDIDATES.title);
  const statusHeader = findField(headers, FIELD_CANDIDATES.status);
  const plusOnesHeader = findField(headers, FIELD_CANDIDATES.plusOnes);
  const noteHeader = findField(headers, FIELD_CANDIDATES.note);

  return rows.slice(1).map((cells, index) => {
    const raw = Object.fromEntries(
      headers.map((header, headerIndex) => [header, (cells[headerIndex] ?? "").trim()]),
    );

    const firstName = firstNameHeader ? raw[firstNameHeader] : "";
    const lastName = lastNameHeader ? raw[lastNameHeader] : "";
    const fallbackEmail = emailHeader ? raw[emailHeader] : "";
    const fullName =
      (fullNameHeader ? raw[fullNameHeader] : "") ||
      [firstName, lastName].filter(Boolean).join(" ") ||
      fallbackEmail ||
      `Guest ${index + 1}`;

    return {
      id: `${slugify(fullName || "guest")}-${index + 1}`,
      fullName,
      firstName,
      lastName,
      email: emailHeader ? raw[emailHeader] : "",
      company: companyHeader ? raw[companyHeader] : "",
      title: titleHeader ? raw[titleHeader] : "",
      status: statusHeader ? raw[statusHeader] : "",
      plusOnes: plusOnesHeader ? raw[plusOnesHeader] : "",
      note: noteHeader ? raw[noteHeader] : "",
      checkedIn: false,
      checkedInAt: null,
      checkInCount: 0,
      raw,
    } satisfies GuestRecord;
  });
}

export default function CheckInPage() {
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("not-checked-in");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      void (async () => {
        try {
          const response = await fetch(DEFAULT_CSV_PATH);
          if (!response.ok) {
            return;
          }
          const text = await response.text();
          const rows = parseCsv(text);
          const importedGuests = buildGuestRecords(rows);
          setGuests(importedGuests);
          setSummary({
            fileName: DEFAULT_CSV_NAME,
            importedAt: new Date().toISOString(),
            guestCount: importedGuests.length,
          });
        } catch {
          // Fall back to an empty state if the bundled CSV is unavailable.
        }
      })();
      return;
    }

    try {
      const parsed = JSON.parse(saved) as {
        guests: GuestRecord[];
        summary: ImportSummary | null;
      };
      setGuests(parsed.guests ?? []);
      setSummary(parsed.summary ?? null);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        guests,
        summary,
      }),
    );
  }, [guests, summary]);

  const stats = useMemo(() => {
    const checkedIn = guests.filter((guest) => guest.checkedIn).length;
    return {
      total: guests.length,
      checkedIn,
      remaining: Math.max(guests.length - checkedIn, 0),
      rate: guests.length ? Math.round((checkedIn / guests.length) * 100) : 0,
    };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return guests
      .filter((guest) => {
        if (filter === "checked-in" && !guest.checkedIn) {
          return false;
        }
        if (filter === "not-checked-in" && guest.checkedIn) {
          return false;
        }
        if (!normalizedQuery) {
          return true;
        }

        return [
          guest.fullName,
          guest.firstName,
          guest.lastName,
          guest.email,
          guest.company,
          guest.title,
          guest.status,
          guest.note,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (a.checkedIn !== b.checkedIn) {
          return a.checkedIn ? 1 : -1;
        }
        return a.fullName.localeCompare(b.fullName);
      });
  }, [filter, guests, query]);

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const importedGuests = buildGuestRecords(rows);

      setGuests(importedGuests);
      setSummary({
        fileName: file.name,
        importedAt: new Date().toISOString(),
        guestCount: importedGuests.length,
      });
      setMessage(`Imported ${importedGuests.length} guests from ${file.name}.`);
      setError(null);
      setQuery("");
      setFilter("not-checked-in");
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "The CSV could not be read.",
      );
      setMessage(null);
    } finally {
      event.target.value = "";
    }
  };

  const toggleCheckIn = (guestId: string) => {
    const now = new Date().toISOString();
    setGuests((current) =>
      current.map((guest) => {
        if (guest.id !== guestId) {
          return guest;
        }
        if (guest.checkedIn) {
          return {
            ...guest,
            checkedIn: false,
            checkedInAt: null,
          };
        }
        return {
          ...guest,
          checkedIn: true,
          checkedInAt: now,
          checkInCount: guest.checkInCount + 1,
        };
      }),
    );
    setMessage(null);
    setError(null);
  };

  const resetCheckIns = () => {
    setGuests((current) =>
      current.map((guest) => ({
        ...guest,
        checkedIn: false,
        checkedInAt: null,
        checkInCount: 0,
      })),
    );
    setMessage("All check-ins were cleared.");
    setError(null);
  };

  const clearImportedList = () => {
    setGuests([]);
    setSummary(null);
    setQuery("");
    setFilter("not-checked-in");
    setMessage("Imported guest list removed from this device.");
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const exportGuestList = () => {
    const blob = new Blob([serializeCsv(guests)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `attention-labs-launch-check-in-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage("Exported the current guest list with check-in status.");
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(197,233,255,0.55),_transparent_34%),linear-gradient(180deg,_#f4efe4_0%,_#fbfaf7_42%,_#ffffff_100%)] text-[#111111]">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 shadow-[0_30px_80px_rgba(25,40,60,0.12)] backdrop-blur">
          <div className="border-b border-black/8 bg-[#111111] px-6 py-5 text-white sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#9ad2ff]">
                  Attention Labs Launch
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  Guest check-in
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                  Upload the RSVP CSV, search guests instantly, check people in at the door,
                  and export the latest attendance record from this device.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-white/8 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/50">Guests</div>
                  <div className="mt-2 text-3xl font-semibold">{stats.total}</div>
                </div>
                <div className="rounded-2xl bg-white/8 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/50">Arrived</div>
                  <div className="mt-2 text-3xl font-semibold">{stats.checkedIn}</div>
                </div>
                <div className="rounded-2xl bg-white/8 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/50">Waiting</div>
                  <div className="mt-2 text-3xl font-semibold">{stats.remaining}</div>
                </div>
                <div className="rounded-2xl bg-[#9ad2ff] px-4 py-3 text-[#111111]">
                  <div className="text-xs uppercase tracking-[0.22em] text-black/55">Check-in</div>
                  <div className="mt-2 text-3xl font-semibold">{stats.rate}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <div className="rounded-[1.5rem] border border-black/10 bg-[#fbfaf7] p-5">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">Import guest list</h2>
                <p className="mt-2 text-sm leading-6 text-black/65">
                  The app tries to detect common columns like name, email, company, title,
                  RSVP status, guest count, and notes.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileImport}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-black"
                >
                  Upload RSVP CSV
                </button>

                {summary ? (
                  <div className="mt-4 rounded-2xl border border-[#9ad2ff] bg-[#eff8ff] p-4 text-sm text-[#12344d]">
                    <div className="font-medium">{summary.fileName}</div>
                    <div className="mt-1">{summary.guestCount} guests imported</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#4d708a]">
                      {summary.fileName === DEFAULT_CSV_NAME
                        ? "Bundled list, then saved in this browser"
                        : "Saved in this browser"}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={exportGuestList}
                    disabled={guests.length === 0}
                    className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#111111] transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Export Check-in CSV
                  </button>
                  <button
                    type="button"
                    onClick={resetCheckIns}
                    disabled={guests.length === 0}
                    className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#111111] transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Reset All Check-ins
                  </button>
                  <button
                    type="button"
                    onClick={clearImportedList}
                    disabled={guests.length === 0}
                    className="inline-flex w-full items-center justify-center rounded-full border border-[#d8c7bc] bg-[#fff5ef] px-4 py-3 text-sm font-medium text-[#7d2a14] transition hover:border-[#c7a693] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Remove Imported List
                  </button>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">How to use it</h2>
                <ol className="mt-3 space-y-3 text-sm leading-6 text-black/72">
                  <li>1. Upload the RSVP CSV from your laptop or tablet.</li>
                  <li>2. Search by name, email, company, or RSVP status.</li>
                  <li>3. Tap <span className="font-medium">Check in</span> as guests arrive.</li>
                  <li>4. Export the CSV any time to capture the latest attendance.</li>
                </ol>
              </div>
            </aside>

            <section className="space-y-4">
              <div className="rounded-[1.5rem] border border-black/10 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search guest, email, company, title, status..."
                    className="min-w-0 flex-1 rounded-full border border-black/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/35"
                  />

                  <div className="grid grid-cols-3 gap-2 rounded-full bg-[#f2efe9] p-1">
                    {[
                      { id: "not-checked-in", label: "Waiting" },
                      { id: "checked-in", label: "Arrived" },
                      { id: "all", label: "All" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFilter(option.id as FilterMode)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          filter === option.id
                            ? "bg-[#111111] text-white"
                            : "text-black/65 hover:text-black"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {message ? (
                  <p className="mt-4 rounded-2xl border border-[#b7e0ba] bg-[#eefbef] px-4 py-3 text-sm text-[#216330]">
                    {message}
                  </p>
                ) : null}
                {error ? (
                  <p className="mt-4 rounded-2xl border border-[#f0c2b6] bg-[#fff1ec] px-4 py-3 text-sm text-[#8b2d1b]">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white">
                <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-black/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/45 sm:px-5">
                  <div>Guest</div>
                  <div>Details</div>
                  <div>Status</div>
                </div>

                {filteredGuests.length === 0 ? (
                  <div className="px-5 py-16 text-center text-sm text-black/55">
                    {guests.length === 0
                      ? "Upload the RSVP CSV to start checking guests in."
                      : "No guests match the current search and filter."}
                  </div>
                ) : (
                  <div className="divide-y divide-black/6">
                    {filteredGuests.map((guest) => (
                      <article
                        key={guest.id}
                        className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_auto] lg:items-center"
                      >
                        <div>
                          <h3 className="text-lg font-semibold tracking-[-0.02em]">{guest.fullName}</h3>
                          <div className="mt-1 text-sm text-black/55">
                            {guest.email || "No email in CSV"}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-black/68">
                          {(guest.company || guest.title) && (
                            <div>
                              {[guest.title, guest.company].filter(Boolean).join(" · ")}
                            </div>
                          )}
                          {guest.status && <div>RSVP: {guest.status}</div>}
                          {guest.plusOnes && <div>Guests: {guest.plusOnes}</div>}
                          {guest.note && <div>Notes: {guest.note}</div>}
                          {guest.checkedInAt && (
                            <div>
                              Checked in at{" "}
                              {new Date(guest.checkedInAt).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 lg:justify-end">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                              guest.checkedIn
                                ? "bg-[#e8f7ec] text-[#24613b]"
                                : "bg-[#f4efe4] text-[#7b5b27]"
                            }`}
                          >
                            {guest.checkedIn ? "Arrived" : "Waiting"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCheckIn(guest.id)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              guest.checkedIn
                                ? "border border-black/10 bg-white text-[#111111] hover:border-black/30"
                                : "bg-[#111111] text-white hover:bg-black"
                            }`}
                          >
                            {guest.checkedIn ? "Undo" : "Check in"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
