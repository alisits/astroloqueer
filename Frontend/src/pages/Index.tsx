import React, { Suspense, lazy } from 'react';
import AstrologyForm from '../components/AstrologyForm';
const StarBackground = lazy(() => import('../components/StarBackground'));
import { useAstrology } from '@/context/AstrologyContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { userInfo, bigThree, horoscopeData } = useAstrology();
  const hasUserData = userInfo && bigThree;

  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <StarBackground />
      </Suspense>
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Logo + Tagline */}
        <div className="text-center mb-12 animate-float">
          <img
            src="/logoTemp_nobackground.png"
            alt="Astroloqueer Logo"
            className="h-24 mx-auto mb-6 logo-glow"
            loading="eager"
            width="96"
            height="96"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Astroloqueer
          </h1>
          <p className="text-xl text-cosmic-pink">
            Horoscopes and Natal charts for the LGBTQ+ community
          </p>
        </div>

        {/* Quick Access for Returning Users */}
        {hasUserData && (
          <div className="max-w-md mx-auto mb-8 bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">✨ Welcome back, {userInfo?.name}!</h2>
            <p className="text-gray-200 mb-4">Ready for your next reading?</p>
            <div className="space-y-3">
              <Link to="/reading">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium">
                  Get New Horoscope
                </Button>
              </Link>
              <Link to="/natal-chart">
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                  View Natal Chart
                </Button>
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-gray-300 hover:text-white underline"
              >
                Fill out new details
              </button>
            </div>
          </div>
        )}

        {/* Astrology Form */}
        <div className="flex justify-center">
          <AstrologyForm />
        </div>

        {/* Explanatory Section */}
        <section className="max-w-3xl mx-auto mt-16 text-white leading-relaxed">
          <section className="max-w-2xl mx-auto bg-black/40 backdrop-blur-md rounded-lg p-6 mb-10 border border-white/10">
            {/*What is Astroloqueer */}
            <h2 className="text-2xl font-semibold text-cosmic-pink mb-2">
              What's Astroloqueer?
            </h2>
            <p className="text-gray-100 leading-relaxed">
              Astroloqueer is a queer-centric astrology space that puts <em>you</em>, your
              identity, pronouns, and lived experience at the heart of every reading. We
              fuse classic natal-chart techniques with today's planetary transits to craft
              daily horoscopes and birth-chart insights that speak in inclusive, 
              gender-affirming language. Whether you're curious about your
              big three or craving guidance that respects and celebrates LGBTQ+ voices,
              you're in the right constellation.
            </p>
          </section>

          {/* Why we ask */}
          <h2 className="text-2xl font-semibold mb-4 text-cosmic-pink">FAQs</h2>
          <h3 className="text-1xl font-semibold mb-2">Why we ask for your birth details</h3>
          <p className="mb-6">
            We use your <strong>date, exact time</strong> and <strong>place of birth</strong> to calculate
            the precise position of each planet at the moment you entered the world. This allows us
            to generate an authentic natal chart that centres queer narratives and lived
            experiences. Based on your natal chart, a customized horoscope is generated considering the positions and transits of the planets at a given time. 
          </p>
           <h3 className="text-1xl font-semibold mb-2">Why we ask for your gender, pronouns and sexual orientation</h3>
          <p className="mb-6">
            We want to generate conscious, considerate and caring readings that take into account the diversity within the LGBTQ+ community. 
            For that we will try to use your <strong>gender and pronouns</strong> as well as consider your <strong>sexual orientation</strong> in our readings.
            While Astrology does not classically consider these details, we know from experience how frustrating it can be to be misgendered or assumed straight. 
            That's why (you may have noticed) we didn't include <em>heterosexual</em> as a <strong> sexual orientation </strong>option. 
            If you are straight feel free to choose <strong>Other</strong> and this will be taken into account. 
          </p>

          {/* Usage & privacy */}
          <h3 className="text-1xl font-semibold mb-2">How we use – and protect – your data</h3>
          <ul className="list-disc space-y-2 pl-6 mb-6">
            <li>Information is processed once to create your personalised reading.</li>
            <li>Data is stored <em>anonymously</em>; names & personal details are deleted after generation.</li>
            <li>We never sell or share your details with advertisers or third‑parties.</li>
            <li>You can request deletion at any time via our <a href="/privacy" className="underline">Privacy&nbsp;Policy</a>.</li>
          </ul>

          {/* Sample horoscope preview */}
          <h3 className="text-1xl font-semibold mb-4">Sample daily horoscope</h3>
          <p className="mb-4">
            Here's how your daily horoscope may look like. Every generated horoscope is slightly different – but your <em>astrological data</em> will remain unchanged during the same day.
          </p>
          <img
            src="/assets/sample-horoscope.png"
            alt="Sample daily horoscope with explanatory call‑outs"
            className="w-full rounded-lg shadow-lg mb-10"
            loading="lazy"
            width="800"
            height="600"
          />

          {/* Sample natal chart preview */}
          <h3 className="text-1xl font-semibold mb-4">Sample natal chart</h3>
          <p className="mb-4">
            Here's a snapshot from our <em>Astroloqueer Origin Chart</em>. Your personalised report
            will look similar – only crafted uniquely for <em>you</em>.
          </p>
          <img
            src="/assets/sample-natal-chart.png"
            alt="Sample natal chart with explanatory call‑outs"
            className="w-full rounded-lg shadow-lg mb-10"
            loading="lazy"
            width="800"
            height="600"
          />

          {/* Consent reminder */}
          <p className="text-sm text-gray-300">
            By submitting the form above you confirm that you've read and agree to our&nbsp;
            <a href="/privacy" className="underline">Privacy Policy</a>. Your data will be used
            solely to generate this chart.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Index;
