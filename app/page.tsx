"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Heart,
  MapPin,
  MessageCircleHeart,
  Sparkles,
  TicketCheck,
  WandSparkles,
  X
} from "lucide-react";

type Wish = {
  name: string;
  message: string;
  createdAt: string;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EVENT_DATE = process.env.NEXT_PUBLIC_EVENT_DATE || "2026-10-02T00:00:01+07:00";
const STORAGE_KEY = "velma-birthday-wishes-v1";

const itinerary = {
  day1: [
    {
      time: "14.00",
      title: "Berangkat",
      detail: "OTW dari Krakatau Tirta Industri Krenceng, Cilegon",
      place: "Krakatau Tirta Industri Krenceng"
    },
    {
      time: "14.00–16.30",
      title: "Perjalanan Bus Primajasa",
      detail: "Menuju Bitung, Tangerang",
      place: "Bitung, Tangerang"
    },
    {
      time: "16.30–18.00",
      title: "Makan / Kunjungan",
      detail: "Pagi Sore @Alam Sutera",
      place: "Jl. Jalur Sutera No.Kav. 20D, East Panunggangan, Serpong, Tangerang"
    },
    {
      time: "18.00–18.05",
      title: "Perjalanan",
      detail: "Menuju Mall Alam Sutera",
      place: "Mall Alam Sutera"
    },
    {
      time: "18.05–18.20",
      title: "Kunjungan ke Little Olie",
      detail: "15 menit",
      place: "Jl. Jalur Sutera Bar. No.Kav. 16, East Panunggangan, Pinang, Tangerang"
    },
    {
      time: "18.20–18.50",
      title: "Perjalanan ke destinasi berikutnya",
      detail: "30 menit",
      place: "Ruko Hamptoni Avenue Paramount Serpong"
    },
    {
      time: "18.50–19.05",
      title: "Beli makanan dibungkus",
      detail: "Qian Dao Chinese Kitchen",
      place: "Ruko Hamptoni Avenue Blok K No. 25, Medang, Pagedangan, Tangerang"
    },
    {
      time: "19.05–19.35",
      title: "Perjalanan ke penginapan",
      detail: "30 menit",
      place: "Green View Apartment"
    },
    {
      time: "19.35–selesai",
      title: "Check-in & Having Fun",
      detail: "Waktu istirahat / acara bebas",
      place: "Collection O Expressia Stay, Green View Apartment, Apartment mt, 22, East Lengkong Gudang, Serpong, Tangerang Selatan"
    }
  ],
  day2: [
    {
      time: "16.00",
      title: "Berangkat dari apartemen",
      detail: "OTW dari Green View Apartment",
      place: "Green View Apartment, Serpong"
    },
    {
      time: "16.00–16.30",
      title: "Perjalanan ke Paws Up",
      detail: "30 menit",
      place: "Ruko Tabespot, Pagedangan"
    },
    {
      time: "16.30–18.00",
      title: "Kunjungan di Paws Up Cat Lounge",
      detail: "1 jam 30 menit",
      place: "Ruko Tabespot Blok G2 No 21, 2nd Floor, Lengkong Kulon, Pagedangan, Tangerang"
    },
    {
      time: "18.00–18.15",
      title: "Perjalanan ke AEON Mall",
      detail: "15 menit",
      place: "AEON Mall BSD"
    },
    {
      time: "18.15–19.45",
      title: "Aktivitas di AEON Mall",
      detail: "1 jam 30 menit",
      place: "AEON Mall BSD"
    },
    {
      time: "19.45–20.00",
      title: "Perjalanan kembali",
      detail: "15 menit",
      place: "Green View Apartment"
    }
  ]
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } }
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

function getCountdown(target: string): Countdown {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60)
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function HomePage() {
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);
  const [activeDay, setActiveDay] = useState<"day1" | "day2">("day1");
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState("Hadir");
  const [guestCount, setGuestCount] = useState("1");
  const [wish, setWish] = useState("");
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isFormatting, setIsFormatting] = useState(false);
  const [aiError, setAiError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCountdown(getCountdown(EVENT_DATE));
    const interval = window.setInterval(() => setCountdown(getCountdown(EVENT_DATE)), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWishes(JSON.parse(saved) as Wish[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const eventDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta"
      }).format(new Date(EVENT_DATE)),
    []
  );

  const currentItinerary = itinerary[activeDay];

  const scrollToRSVP = () => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });

  async function formatWish() {
    if (!wish.trim()) {
      setAiError("Tulis ucapan dulu, nanti AI yang bantu merapikannya.");
      return;
    }

    setIsFormatting(true);
    setAiError("");

    try {
      const response = await fetch("/api/ai-wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message: wish })
      });

      const data = (await response.json()) as { formatted?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "AI tidak dapat memproses ucapan.");
      setWish(data.formatted || wish);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Terjadi kendala. Coba lagi.");
    } finally {
      setIsFormatting(false);
    }
  }

  function submitRSVP(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage("");

    if (!name.trim()) {
      setSubmitMessage("Nama perlu diisi.");
      return;
    }

    if (wish.trim()) {
      const item: Wish = {
        name: name.trim(),
        message: wish.trim(),
        createdAt: new Date().toISOString()
      };
      const next = [item, ...wishes].slice(0, 12);
      setWishes(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    setSubmitMessage(
      attendance === "Hadir"
        ? `RSVP tersimpan untuk ${guestCount} orang. Sampai ketemu! ✨`
        : "RSVP tersimpan. Terima kasih sudah memberi kabar!"
    );
    setWish("");
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked in some browsers/contexts.
    }
  }

  return (
    <main className="page-grid min-h-screen overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <nav className="glass sticky top-4 z-40 flex items-center justify-between rounded-full px-4 py-3 sm:px-5">
          <a href="#home" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-blue-500 text-white">
              V
            </span>
            Velma&apos;s Day
          </a>
          <div className="hidden items-center gap-6 text-sm text-neutral-500 md:flex">
            <a href="#story" className="transition hover:text-violet-700">Story</a>
            <a href="#journey" className="transition hover:text-violet-700">Journey</a>
            <a href="#rsvp" className="transition hover:text-violet-700">RSVP</a>
          </div>
          <button
            onClick={copyInvite}
            className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-violet-800 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Share"}
          </button>
        </nav>

        <section id="home" className="relative py-20 sm:py-28">
          <motion.div
            aria-hidden
            animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-16 top-10 h-52 w-52 rounded-full bg-violet-300/25 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-0 top-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl"
          />

          <motion.div initial="hidden" animate="show" variants={stagger} className="relative mx-auto max-w-4xl text-center">
            <motion.p variants={fadeUp} className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
              A little celebration for My Dearest Purple
            </motion.p>
            <motion.h1 variants={fadeUp} className="mx-auto max-w-4xl text-balance font-serif text-5xl font-medium tracking-tight sm:text-7xl">
              Simple moments with you, <span className="text-gradient italic">Always Brighter than ever</span>,
              <br />
              So let's conquer the world together, Sayang.
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-7 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
              Hai sayang, this is me ur Vitamin (B)lue💙.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={scrollToRSVP}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 sm:w-auto"
              >
                <Heart size={17} />
                Save the moment
              </button>
              <a
                href="#journey"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                See our journey
                <ArrowDown size={17} />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["DATE", eventDateLabel.split(",").slice(0, 2).join(",")],
                ["DRESS DAY 1", "Batik"],
                ["DRESS DAY 2", "Casual • Putih Cream"],
                ["MOOD", "Simple • Warm • Fun"]
              ].map(([label, value]) => (
                <div key={label} className="glass rounded-2xl px-4 py-4 text-left">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400">{label}</p>
                  <p className="mt-1 text-sm font-medium leading-5 text-neutral-800">{value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section aria-label="Countdown" className="relative -mt-2 pb-20">
          <div className="rounded-[2rem] bg-gradient-to-r from-violet-600 via-violet-500 to-blue-500 p-[1px] shadow-2xl shadow-violet-200/50">
            <div className="rounded-[calc(2rem-1px)] bg-white/95 px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">Counting down to your day</p>
                  <p className="mt-2 text-sm text-neutral-500">{eventDateLabel} WIB</p>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {Object.entries(countdown).map(([unit, value]) => (
                    <div key={unit} className="min-w-[64px] rounded-2xl bg-violet-50 px-3 py-3 text-center sm:min-w-[82px] sm:px-4">
                      <div className="text-2xl font-semibold tracking-tight text-violet-900 sm:text-3xl">
                        {isClient ? pad(value) : "00"}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-400">{unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="grid scroll-mt-24 gap-12 pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">The little idea</motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              It doesn&apos;t need to be big to feel special.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl leading-7 text-neutral-600">
              Tapi yang jelas, aku akan selalu bikin kamu dapetin momen spesial yaa, baby. Karena cara aku bahagia-in diri aku sekarang adalah dengan bahagia-in kamu hehe.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="glass rounded-[2rem] p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-violet-700">For the two of us</p>
                <p className="mt-2 text-2xl font-serif">Purple × Blue</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 text-violet-700">
                <Sparkles size={21} />
              </div>
            </div>
            <div className="mt-7 h-px bg-neutral-100" />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-violet-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">Day 01</p>
                <p className="mt-2 text-sm font-semibold text-violet-950">Batik</p>
                <p className="mt-1 text-sm leading-6 text-violet-900/60">Warm, classic, sedikit dressed-up.</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">Day 02</p>
                <p className="mt-2 text-sm font-semibold text-blue-950">Casual • Putih Cream</p>
                <p className="mt-1 text-sm leading-6 text-blue-900/60">Clean, easy, nyaman untuk jalan santai.</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="journey" className="scroll-mt-24 pb-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">The journey</p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Two days, one little story.</h2>
            </div>
            <div className="flex w-full max-w-sm rounded-full bg-neutral-100 p-1 sm:w-auto">
              {(["day1", "day2"] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${activeDay === day ? "bg-white text-violet-800 shadow-sm" : "text-neutral-500"}`}
                >
                  {day === "day1" ? "Day 1" : "Day 2"}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="mt-8 grid gap-4 lg:grid-cols-2"
            >
              {currentItinerary.map((item, index) => (
                <motion.article
                  key={`${item.time}-${item.title}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.035, duration: 0.4 }}
                  className="glass group rounded-[1.75rem] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
                      {activeDay === "day1" ? <Clock3 size={19} /> : <MapPin size={19} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">{item.time}</span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500">{activeDay === "day1" ? "Day 1" : "Day 2"}</span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-neutral-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{item.detail}</p>
                      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-neutral-500">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span>{item.place}</span>
                      </div>
                    </div>
                    <ArrowUpRight size={17} className="mt-1 shrink-0 text-neutral-300 transition group-hover:text-violet-500" />
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

        <section className="grid gap-5 pb-24 md:grid-cols-2">
          <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-500 p-6 text-white shadow-xl shadow-violet-200/70 sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">Where</p>
                <h3 className="mt-3 font-serif text-3xl">Green View Apartment</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">
                  Collection O Expressia Stay, Green View Apartment, Serpong, Tangerang Selatan.
                </p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                <MapPin size={21} />
              </div>
            </div>
            <a
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:translate-x-0.5"
              href="https://maps.app.goo.gl/VVQKPDkpyXcmxn37A"
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="glass rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Dress code</p>
                <h3 className="mt-3 font-serif text-3xl">Keep Formal and Casual.</h3>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                <TicketCheck size={21} />
              </div>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">Day 1</p>
                <p className="mt-2 font-semibold text-violet-950">Batik</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">Day 2</p>
                <p className="mt-2 font-semibold text-blue-950">Casual Putih Cream</p>
              </div>
            </div>
          </div>
        </section>

        <section id="rsvp" className="scroll-mt-24 pb-24">
          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">RSVP & wishes</p>
              <h2 className="mt-3 max-w-xl font-serif text-4xl tracking-tight sm:text-5xl">Leave a little love here.</h2>
              <p className="mt-5 max-w-lg leading-7 text-neutral-600">
                Konfirmasi kehadiran dan titip satu ucapan. Kamu bisa biarkan ucapanmu tetap apa adanya atau minta AI membuatnya sedikit lebih hangat dan puitis.
              </p>
              <div className="mt-8 rounded-3xl bg-neutral-950 p-5 text-white sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <MessageCircleHeart size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI Wish Formatter</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[2rem] p-5 sm:p-7">
              <form onSubmit={submitRSVP} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-800">Nama</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-neutral-800">Kehadiran</label>
                    <select
                      value={attendance}
                      onChange={(e) => setAttendance(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      <option>Hadir</option>
                      <option>Belum pasti</option>
                      <option>Tidak hadir</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-800">Jumlah orang</label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      disabled={attendance === "Tidak hadir"}
                      className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition disabled:cursor-not-allowed disabled:bg-neutral-50 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="1">1 orang</option>
                      <option value="2">2 orang</option>
                      <option value="3">3 orang</option>
                      <option value="4">4 orang</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm font-semibold text-neutral-800">Ucapan</label>
                    <span className="text-xs text-neutral-400">{wish.length}/10000</span>
                  </div>
                  <textarea
                    value={wish}
                    onChange={(e) => setWish(e.target.value.slice(0, 10000))}
                    rows={5}
                    placeholder="Tulis ucapan ulang tahun di sini..."
                    className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 leading-6 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={formatWish}
                    disabled={isFormatting || !wish.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <WandSparkles size={17} />
                    {isFormatting ? "Sedang dirapikan..." : "Rapikan dengan AI"}
                  </button>
                  {aiError && (
                    <p className="mt-2 text-xs leading-5 text-rose-500">{aiError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
                >
                  <Heart size={17} />
                  Send RSVP & Wish
                </button>

                {submitMessage && (
                  <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                    <Check size={17} className="mt-0.5 shrink-0" />
                    <span>{submitMessage}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        <section className="pb-14">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">Wishlist</p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight">Little notes from people we love.</h2>
            </div>
            <a href="#rsvp" className="hidden items-center gap-2 text-sm font-semibold text-violet-700 sm:flex">
              Add yours <ArrowUpRight size={16} />
            </a>
          </div>

          {wishes.length === 0 ? (
            <div className="glass rounded-[2rem] px-6 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                <Heart size={20} />
              </div>
              <p className="mt-4 text-sm font-medium text-neutral-800">Belum ada ucapan.</p>
              <p className="mt-1 text-sm text-neutral-500">Jadilah yang pertama meninggalkan satu kalimat hangat.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence initial={false}>
                {wishes.map((item) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={`${item.createdAt}-${item.name}`}
                    className="glass rounded-[1.75rem] p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 text-violet-700">
                        <Heart size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                        <p className="mt-3 font-serif text-xl leading-8 text-neutral-700">“{item.message}”</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <footer className="border-t border-neutral-200/70 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-neutral-800">
            Made with <Heart size={15} className="fill-violet-500 text-violet-500" /> for Velma
          </div>
          <p className="mt-2 text-xs text-neutral-400">I Will Always Love You Baby</p>
        </footer>
      </div>
    </main>
  );
}
