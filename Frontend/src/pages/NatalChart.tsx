import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAstrology } from "@/context/AstrologyContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * NatalChartPage.tsx – dynamic natal‑chart card + CTA + static SEO copy
 * Mirrors the Reading page structure / styling (white text on cosmic dark).
 */

export default function NatalChartPage() {
  const { natalChart, fetchNatalChart, isLoading, userInfo, bigThree, astrologyPayload } = useAstrology();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch natal chart if we don't already have it and we're not loading
    if (!natalChart && !isLoading && userInfo) {
      handleFetchNatalChart();
    }
  }, [natalChart, isLoading, userInfo]);

  const handleFetchNatalChart = async () => {
    try {
      setError(null);
      await fetchNatalChart();
    } catch (error) {
      console.error("Error fetching natal chart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate natal chart";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const renderFormattedChart = (txt: string) =>
    txt.split(/\n+/).map((p, i) => (
      <p key={i} className="mb-4 leading-relaxed text-white/90">
        {p.trim()}
      </p>
    ));

  const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-white/20 rounded w-3/4"></div>
      <div className="h-4 bg-white/20 rounded w-full"></div>
      <div className="h-4 bg-white/20 rounded w-5/6"></div>
      <div className="h-4 bg-white/20 rounded w-4/5"></div>
    </div>
  );

  const hasRequiredData = () => {
    return userInfo && bigThree && astrologyPayload?.astrologyData && astrologyPayload?.houseCusps;
  };

  return (
    <>
      {/* ── Natal chart card (dynamic) ───────────────────── */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg p-6 w-full max-w-2xl mx-auto mt-12 space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-white">🗺️ Your Natal Chart</h2>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-300 mb-4">{error}</p>
            {!hasRequiredData() && (
              <p className="text-white/70 mb-4">
                You need to generate your horoscope first to access your natal chart.
              </p>
            )}
            <Button
              onClick={() => navigate("/reading")}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
            >
              Generate Horoscope First
            </Button>
          </div>
        ) : natalChart ? (
          <div className="mt-4 space-y-3">
            {renderFormattedChart(natalChart)}
          </div>
        ) : (
          <p className="text-white">🔍 Calculating your natal chart…</p>
        )}

        <Button
          className="w-full bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold mt-4"
          onClick={handleFetchNatalChart}
          disabled={isLoading || !hasRequiredData()}
        >
          {isLoading ? "Generating..." : "Regenerate Chart"}
        </Button>

        <Button
          className="w-full bg-indigo-200 hover:bg-indigo-300 text-indigo-800 font-bold mt-4"
          onClick={() => navigate("/reading")}
        >
          Daily Horoscope
        </Button>
      </div>

      {/* ── Static natal‑chart explanation (SEO) ─────────── */}
      <article
        className="prose prose-invert text-white/90 prose-headings:text-white prose-strong:text-white prose-li:text-white/90 prose-th:text-white prose-td:text-white/80 prose-a:text-pink-400 mx-auto max-w-3xl space-y-6"
      >
        <h3><strong>Why Your Natal Chart Matters</strong></h3>
        <p>
          A natal chart is a <em>snapshot of the sky</em> at the exact moment and
          place of your birth. It maps the Sun, Moon and planets across twelve
          houses—sectors that describe every dimension of life, from
          identity to collective purpose. For queer folks, understanding those
          placements can be a radical act of self‑affirmation: it offers a
          framework to name desires, challenges, and sources of power beyond
          heteronormative scripts.
        </p>

        <h3><strong>The Houses—reframed for Queer Life</strong></h3>
        <ul>
          <li><strong>1st House – Self &amp; Presentation:</strong> How your queer essence meets the world.</li>
          <li><strong>4th House – Chosen Family:</strong> Roots, safe space, ancestry beyond bloodlines.</li>
          <li><strong>7th House – Partnerships:</strong> Intimacy models outside traditional matrimony.</li>
          <li><strong>10th House – Public Impact:</strong> Your activism and visibility in larger culture.</li>
        </ul>


        <h3><strong>Elements &amp; Modalities</strong></h3>
        <p>
          Fire, Earth, Air, Water; Cardinal, Fixed, Mutable—your chart's element‑modality
          balance highlights innate talents and potential burn‑out zones. Many
          queer charts show strong Mutable energy (Gemini, Virgo, Sagittarius,
          Pisces): a natural gift for fluid identities and adaptability.
        </p>

        <h3 id="faq"><strong>FAQ</strong></h3>
        <h4><strong>Do you use Placidus or Whole Sign?</strong></h4>
        <p>
          We use Placidus for all calculations, so be aware that your reading may be incorrect in extreme latitudes.
        </p>
        <h4><strong>Is there a nice visualisation?</strong></h4>
        <p>
          Coming soon!
        </p>
        <h4><strong>Is the data private?</strong></h4>
        <p>
          Absolutely. Birth details are encrypted, processed, then detached from
          personal identifiers. Read more in our <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </article>
    </>
  );
}
