import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAstrology } from "@/context/AstrologyContext";
import { Button } from "@/components/ui/button";
import BreadcrumbNav from "@/components/BreadcrumbNav";

/**
 * Reading.tsx – user's dynamic horoscope page plus SEO‑friendly static copy
 * All body text uses white / light colours to match dark cosmos theme.
 */

const Reading = () => {
  const { horoscopeData, fetchHoroscope, isLoading, userInfo } = useAstrology();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch horoscope if we don't already have it and we're not loading
    // This prevents duplicate API calls when user navigates from form
    if (!horoscopeData && !isLoading && userInfo) {
      fetchHoroscope();
    }
  }, [horoscopeData, isLoading, userInfo]); // Add dependencies back but with proper checks

  const renderFormattedHoroscope = (txt: string) =>
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

  return (
    <>
      <BreadcrumbNav />

      {/* ── Horoscope card (dynamic) ─────────────────────── */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg p-6 w-full max-w-2xl mx-auto mt-12 space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-white">✨ Your Horoscope</h2>

        {isLoading ? (
          <LoadingSkeleton />
        ) : horoscopeData ? (
          <div className="mt-4 space-y-3">{renderFormattedHoroscope(horoscopeData)}</div>
        ) : (
          <p className="text-white">🔍 Generating your horoscope…</p>
        )}

        <Button
          className="w-full bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold mt-4"
          onClick={() => fetchHoroscope()}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Get New Reading"}
        </Button>

        <Button
          className="w-full bg-indigo-200 hover:bg-indigo-300 text-indigo-800 font-bold mt-4"
          onClick={() => navigate("/natal-chart")}
        >
          Learn about your natal chart
        </Button>
      </div>

      {/* ── Static explanatory content (SEO) ───────────────────────── */}
        <article className="prose prose-invert text-white/90
                    prose-headings:text-white
                    prose-strong:text-white
                    prose-li:text-white/90
                    prose-th:text-white
                    prose-td:text-white/80
                    prose-a:text-pink-400
                    mx-auto max-w-3xl space-y-6">

        <p>

        </p>
        <h3><strong>What You'll Find on Your Astroloqueer Reading</strong></h3>
        <p>
          Astrology has always spoken in many dialects—from Hellenistic techniques to
          modern psychological lenses. <strong>Astroloqueer</strong> adds one more: a
          language that centres queer lives, chosen families, and fluid identities.
        </p>
        <h3><strong>The "Big Three" through a queer lens</strong></h3>
        <ul>
          <li><strong>Sun sign:</strong> Where your self-expression shines without apology.</li>
          <li><strong>Moon sign:</strong> How you nurture yourself when heteronormative spaces don't.</li>
          <li><strong>Rising sign:</strong> The vibe you radiate in queer community first impressions.</li>
        </ul>
        <blockquote>
          <p>
            Example: A Libra Sun might crave harmony, but in queer praxis that can
            mean crafting safer spaces rather than simply "keeping the peace."
          </p>
        </blockquote>
        <h3><strong>Planetary allies &amp; challenges</strong></h3>
          <p>
            We can understand each planet through an ally that works toward the community. The challenges may be heavier that for non-LGBTQ+ folks.
            For example, Venus can root our self-love rituals while also hiding a People-pleasing behaviour.
            Mars can enbody the Activist energy we so much need, while may also lead to burn-our cycles. 
          </p>
        
        <h3><strong>Transits: What's lighting up now?</strong></h3>
        <p>
          A transit is a conversation between today's sky and your natal chart. We
          flag the <strong>three strongest aspects</strong> for the next four weeks.
        </p>
        <h3><strong>Extra features you won't get elsewhere</strong></h3>
        <ol>
          <li>Inclusive language – no gender binaries; we talk energy, not gender.</li>
          <li>Pronoun‑aware copy – our engine respects the pronouns you enter.</li>
          <li>Queer‑centric archetypes – houses reframed as domains like <em>Queer Joy</em>.</li>
        </ol>
        <h3 id="faq"><strong>FAQ</strong></h3>
        <h4><strong>Is this reading reliable?</strong></h4>
        <p>
          The core calculation is algorithmic based on the most accepted astrological calculations, including
          highy accurate geolocation to provide a more specific reading and includes your personal astrological 
          details as well as the current transits affecting us all.
        </p>
         <h4><strong>Why do we need a Queer Astrology Reading?</strong></h4>
        <p>
          Most commercial readings do not consider the specifics of the LGBTQ+ community within their interpretatiions. 
          Astroloqueer was born from the frustration and lack of coverage for queer astrological readings. 
        </p>
        <h4><strong>Do you cover synastry or composite charts?</strong></h4>
        <p>
          For now we only provide a high‑level snapshot of your daily horoscope and natal-chart.
        </p>
      </article>
    </>
  );
};

export default Reading;
