import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAstrology } from "@/context/AstrologyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AstrologyRequest } from "@/context/AstrologyContext";

const AstrologyForm = () => {
  const navigate = useNavigate();
  const {
    fetchGeolocation,
    fetchAstrology,
    clearData,                
  } = useAstrology();

  /* ───────── hard-refresh reset ───────── */
  useEffect(() => {
    const handleRefresh = () => {
      sessionStorage.clear();
      clearData();
      setFormData(initialFormData);
    };
    window.addEventListener("beforeunload", handleRefresh);
    return () => window.removeEventListener("beforeunload", handleRefresh);
  }, [clearData]);

  /* ───────── local form state ───────── */
  const initialFormData = {
    name: "",
    birthDate: "",
    birthTime: "",
    location: "",
    genderIdentity: "",
    pronouns: "",
    orientation: "",
  };

  const [formData, setFormData] = useState(() => {
    const stored = sessionStorage.getItem("astrologyForm");
    return stored ? JSON.parse(stored) : initialFormData;
  });

  useEffect(() => {
    sessionStorage.setItem("astrologyForm", JSON.stringify(formData));
  }, [formData]);

  /* ───────── submit handler ───────── */
 const handleSubmit = async (
  e: React.FormEvent,
  destination: "/reading"
) => {
  e.preventDefault();

  if (!formData.name || !formData.birthDate || !formData.location) {
    toast.error("Please fill in all required fields");
    return;
  }

  // Set loading state and userInfo immediately to prevent navigation issues
  const userInfo = {
    name: formData.name,
    genderIdentity: formData.genderIdentity,
    pronouns: formData.pronouns,
    orientation: formData.orientation,
    location: formData.location,
    birthDate: formData.birthDate,
    birthTime: formData.birthTime || "12:00",
  };
  
  // Store userInfo immediately so ProtectedRoute knows we have data
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
  
  // Clear previous state first so target route sees a consistent state
  clearData();

  // Navigate immediately
  navigate(destination); // ⏩ User experience is now snappy

  // Run the rest in background
  (async () => {
    try {
      const geo = await fetchGeolocation(formData.location);
      if (!geo) {
        toast.error("Failed to fetch location, please try again.");
        return;
      }

      const astrologyRequest: AstrologyRequest = {
        birthDate: formData.birthDate,
        birthTime: formData.birthTime || "12:00",
        latitude: geo.latitude,
        longitude: geo.longitude,
      };

      void fetchAstrology(astrologyRequest, userInfo).catch(console.error);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Something went wrong. Please try again.");
    }
  })();
};

  return (
    <form
      id="daily-form"
      className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg p-6 w-full max-w-md space-y-6 shadow-lg"
      data-testid="astrology-form"
    >
      {/* ───────── basic inputs ───────── */}
      {[
        { label: "Your Name", name: "name", type: "text", required: true },
        { label: "Birth Date", name: "birthDate", type: "date", required: true },
        { label: "Birth Time (optional)", name: "birthTime", type: "time" },
        { label: "Birth Location", name: "location", type: "text", required: true },
      ].map(({ label, name, type, required }) => (
        <div className="space-y-2" key={name}>
          <label className="block text-black">{label}</label>
          <Input
            type={type}
            required={required}
            value={(formData as any)[name]}
            onChange={(e) =>
              setFormData({ ...formData, [name]: e.target.value })
            }
          />
        </div>
      ))}

      {/* ───────── dropdowns  ───────── */}
      <SelectField
        label="Gender Identity"
        value={formData.genderIdentity}
        onChange={(v) => setFormData({ ...formData, genderIdentity: v })}
        options={[
          "Woman",
          "Man",
          "Non-binary",
          "Transgender",
          "Transsexual",
          "Genderqueer",
          "Genderfluid",
          "Agender",
          "Questioning",
          "Intersex",
          "Gender Non-conforming",
          "Other",
          "Prefer not to say",
        ]}
      />

      <SelectField
        label="Pronouns"
        value={formData.pronouns}
        onChange={(v) => setFormData({ ...formData, pronouns: v })}
        options={[
          "She/Her",
          "He/Him",
          "They/Them",
          "Any Pronouns",
          "No Pronouns",
          "Other",
          "Prefer not to say",
        ]}
      />

      <SelectField
        label="Sexual Orientation"
        value={formData.orientation}
        onChange={(v) => setFormData({ ...formData, orientation: v })}
        options={[
          "Queer",
          "Lesbian",
          "Gay",
          "Bisexual",
          "Pansexual",
          "Asexual",
          "Questioning",
          "Other",
          "Prefer not to say",
        ]}
      />

      {/* ───────── buttons ───────── */}
      <div className="flex flex-col space-y-2">
        <Button
          className="w-full bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold"
          type="button"
          onClick={(e) => handleSubmit(e, "/reading")}
        >
          Get Your Horoscope
        </Button>
       

        <Button
          className="w-full bg-red-200 hover:bg-red-300 text-red-800 font-bold"
          type="button"
          onClick={() => setFormData(initialFormData)}
        >
          Clear Data
        </Button>

      </div>
    </form>
  );
};

/* ───────── dropdown helper ───────── */
const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div className="space-y-2">
    <label className="block text-black">{label}</label>
    <select
      className="w-full rounded-md border border-white/30 bg-gray-100/30 backdrop-blur-md p-2 text-black placeholder:text-gray-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt} value={opt.toLowerCase()}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default AstrologyForm;
