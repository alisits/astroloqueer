import { api } from "@/lib/api";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";

export const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem("uniqueUserId");
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("uniqueUserId", userId);
  }
  return userId;
};

interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface AstrologyRequest {
  birthDate: string;
  birthTime?: string;
  latitude: number;
  longitude: number;
}

interface UserInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
  genderIdentity: string;
  pronouns: string;
  orientation: string;
}

interface AstrologyContextType {
  geoData: Geolocation | null;
  astrologyPayload: any | null;
  bigThree: { sun: string; moon: string; rising: string } | null;
  transits: any | null;
  userInfo: UserInfo | null;
  horoscopeData: string | null;
  natalChart: string | null;
  lastInputHash: string | null;
  isLoading: boolean;
  fetchGeolocation: (location: string) => Promise<Geolocation | null>;
  fetchAstrology: (userData: AstrologyRequest, userInfo: UserInfo) => Promise<void>;
  fetchHoroscope: () => Promise<void>;
  fetchNatalChart: () => Promise<string | null>;
  clearData: () => void;
  setAstrologyPayload: (payload: AstrologyRequest) => void;
  setUserInfo: (user: UserInfo) => void;
}

const AstrologyContext = createContext<AstrologyContextType | null>(null);

export const AstrologyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [geoData, setGeoData] = useState<Geolocation | null>(null);
  const [astrologyPayload, setAstrologyPayload] = useState<any | null>(null);
  const [bigThree, setBigThree] = useState<{ sun: string; moon: string; rising: string } | null>(null);
  const [transits, setTransits] = useState<any | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [horoscopeData, setHoroscopeData] = useState<string | null>(null);
  const [lastInputHash, setLastInputHash] = useState<string | null>(null);
  const [natalChart, setNatalChart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const queryClient = useQueryClient();

 /* ───── 1. HYDRATE userInfo on first load ───── */
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) setUserInfo(JSON.parse(stored));
    // run exactly once on mount
  }, [])
   /* ───── 2. (optional) PERSIST any updates ───── */
  useEffect(() => {
    if (userInfo) localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }, [userInfo]);
  
  const fetchGeolocation = async (location: string): Promise<Geolocation | null> => {
    if (geoData) return geoData;
    try {
      const response = await fetch(api("/geocode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: location }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch geolocation");
      setGeoData(data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching geolocation:", error);
      return null;
    }
  };

  const fetchAstrology = async (userData: AstrologyRequest, userInfoInput: UserInfo) => {
    if (isLoading) {
      console.log("⏳ Already loading, skipping duplicate request");
      return;
    }

    // Set userInfo and loading state immediately so ProtectedRoute shows loading right away
    setUserInfo(userInfoInput);
    setIsLoading(true);
    
    try {
      console.log("🚀 Starting astrology data fetch...");
      
      // Run API calls in parallel for better performance
      const [astrologyResponse, transitResponse] = await Promise.all([
        fetch(api("/astrology"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }),
        fetch(api("/transits"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }),
      ]);

      const [astrologyData, transitData] = await Promise.all([
        astrologyResponse.json(),
        transitResponse.json(),
      ]);

      if (!astrologyResponse.ok) throw new Error(astrologyData.error || "Failed to fetch astrology data");
      if (!transitResponse.ok) throw new Error(transitData.error || "Failed to fetch transits");

      console.log("🔮 Received astrology data:", astrologyData);
      console.log("🪐 Received transits:", transitData);

      const fullPayload = {
        ...astrologyData,
        transits: transitData.transits,
      };

      setAstrologyPayload(fullPayload);
      setBigThree(astrologyData.bigThree);
      
      // Cache the data with React Query
      queryClient.setQueryData(['astrology', userData], fullPayload);

      // Now fetch the horoscope immediately after getting astrology data
      console.log("✨ Fetching horoscope after astrology data...");
      await fetchHoroscopeInternal(fullPayload, userInfoInput);
    } catch (error) {
      console.error("❌ Error fetching astrology or transits:", error);
      // Don't set loading to false on error - let the user see the error and retry
    } finally {
      setIsLoading(false);
    }
  };

  // Internal function to fetch horoscope (used by both fetchAstrology and fetchHoroscope)
  const fetchHoroscopeInternal = async (payload?: any, userInfoInput?: UserInfo) => {
    const astrologyData = payload || astrologyPayload;
    const userData = userInfoInput || userInfo;
    const bigThreeData = astrologyData?.bigThree || bigThree;

    if (!bigThreeData || !astrologyData?.transits || !userData) {
      console.error("❌ Missing data for horoscope generation:", {
        bigThree: bigThreeData,
        transits: astrologyData?.transits,
        userInfo: userData,
      });
      return;
    }

    // Check if we already have horoscope data to prevent duplicate calls
    if (horoscopeData && !payload) {
      console.log("✅ Horoscope already exists, skipping API call");
      return;
    }

    const horoscopePayload = {
      astrologyPayload: {
        bigThree: bigThreeData,
        transits: astrologyData.transits,
      },
      userInfo: userData,
    };

    console.log("🛰 Fetching horoscope with payload:", horoscopePayload);

    try {
      const response = await fetch(api("/horoscope"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horoscopePayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch horoscope");

      setHoroscopeData(data.horoscope);
      console.log("✅ Horoscope received:", data.horoscope);
    } catch (error) {
      console.error("❌ Error fetching horoscope:", error);
    }
  };

  const fetchHoroscope = async () => {
    await fetchHoroscopeInternal();
  };

  const fetchNatalChart = async (): Promise<string | null> => {
    if (isLoading) {
      console.log("⏳ Already loading natal chart, skipping duplicate request");
      return null;
    }

    if (!bigThree || !astrologyPayload?.astrologyData || !astrologyPayload?.houseCusps || !userInfo) {
      console.error("❌ Missing data for natal chart generation:", {
        bigThree,
        astrologyData: astrologyPayload?.astrologyData,
        houseCusps: astrologyPayload?.houseCusps,
        userInfo,
      });
      // Show error to user instead of just returning null
      throw new Error("Missing astrological data. Please generate your horoscope first.");
    }
  
    setIsLoading(true);
    
    try {
      const payload = {
        astrologyPayload: {
          bigThree,
          astrologyData: astrologyPayload.astrologyData,
          houseCusps: astrologyPayload.houseCusps,
        },
        userInfo,
      };
    
      console.log("🛰 Sending payload to /natal-chart:", payload);
    
      const response = await fetch(api("/natal-chart"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch natal chart");
    
      setNatalChart(data.reading);
      console.log("✅ Natal chart received:", data.reading);
      return data.reading;
    } catch (error) {
      console.error("🌑 Error fetching natal chart:", error);
      throw error; // Re-throw to let the component handle it
    } finally {
      setIsLoading(false);
    }
  };


  const clearData = () => {
    setGeoData(null);
    setAstrologyPayload(null);
    setBigThree(null);
    setTransits(null);
    setUserInfo(null);
    setHoroscopeData(null);
    setLastInputHash(null);
    setNatalChart(null);
    // Clear React Query cache
    queryClient.clear();
  };

  return (
    <AstrologyContext.Provider
      value={{
        geoData,
        astrologyPayload,
        bigThree,
        transits,
        userInfo,
        horoscopeData,
        natalChart,
        lastInputHash,
        isLoading,
        fetchGeolocation,
        fetchAstrology,
        fetchHoroscope,
        fetchNatalChart,
        clearData,
        setAstrologyPayload,
        setUserInfo
      }}
    >
      {children}
    </AstrologyContext.Provider>
  );
};

export const useAstrology = () => {
  const context = useContext(AstrologyContext);
  if (!context) throw new Error("useAstrology must be used within an AstrologyProvider");
  return context;
};
