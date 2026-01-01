"use client";

import { useState } from "react";
import { MapPin, Stethoscope, Search, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchFormData {
  location: string;
  specialty: string;
}

const specialists = [
"General Practitioner",
"Allergist/Immunologist",
"Anesthesiologist",
"Cardiologist",
"Dermatologist",
"Emergency Medicine",
"Endocrinologist",
"Family Medicine",
"Gastroenterologist",
"Geriatrician",
"Gynecologist",
"Hematologist",
"Infectious Disease",
"Internal Medicine",
"Nephrologist",
"Neurologist",
"Obstetrician",
"Oncologist",
"Ophthalmologist",
"Orthopedic Surgeon",
"Otolaryngologist (ENT)",
"Pathologist",
"Pediatrician",
"Plastic Surgeon",
"Psychiatrist",
"Pulmonologist",
"Radiologist",
"Rheumatologist",
"Surgeon",
"Urologist"];


const popularSearches = [
"General Practitioner",
"Cardiologist",
"Dermatologist",
"Psychiatrist",
"Pediatrician"];


export const HealthProfessionalSearch = () => {
  const [formData, setFormData] = useState<SearchFormData>({
    location: "",
    specialty: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInputChange = (field: keyof SearchFormData) => (
  e: React.ChangeEvent<HTMLInputElement>) =>
  {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSpecialtySelect = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialty
    }));
    setOpen(false);
  };

  const handlePopularSearch = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialty
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location.trim() && !formData.specialty.trim()) {
      toast.error("Please enter a location or specialty to search");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Searching for ${formData.specialty || "professionals"} in ${formData.location || "your area"}...`);

      // Here you would typically make an API call to search for health professionals
      console.log("Search parameters:", formData);

    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative py-12 md:py-20 px-4 sm:px-6 md:px-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-cyan-50/30 pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto">
        {/* Header content */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
            Find Health Professionals{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Near You
            </span>
          </h1>
          <p className="font-sans text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
            Search by location and specialty to connect with qualified healthcare professionals
          </p>
        </div>

        {/* Search card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Search inputs */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {/* Location search */}
                <div className="relative group">
                  <label htmlFor="location" className="sr-only">
                    Enter your location
                  </label>
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter your location..."
                    value={formData.location}
                    onChange={handleInputChange("location")}
                    className="pl-10 h-12 text-base border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    aria-label="Location search" />
                </div>

                {/* Specialty search with dropdown */}
                <div className="relative group">
                  <label htmlFor="specialty" className="sr-only">
                    Search for specialists
                  </label>
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full h-12 justify-between pl-10 pr-4 text-left font-normal border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:bg-transparent">

                        <span className="!px-8">
                          {formData.specialty || "Search for specialists..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search specialties..." />
                        <CommandList>
                          <CommandEmpty>No specialty found.</CommandEmpty>
                          <CommandGroup>
                            {specialists.map((specialist) =>
                            <CommandItem
                              key={specialist}
                              value={specialist}
                              onSelect={() => handleSpecialtySelect(specialist)}>

                                <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.specialty === specialist ? "opacity-100" : "opacity-0"
                                )} />

                                {specialist}
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Search button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-3 h-12 min-w-[160px] rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  aria-label={isLoading ? "Searching..." : "Search for health professionals"}>
                  {isLoading ?
                  <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Searching...
                    </> :

                  <>
                      <Search className="mr-2 h-5 w-5" />
                      Search
                    </>
                  }
                </Button>
              </div>
            </form>

            {/* Popular searches */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((search) =>
                <button
                  key={search}
                  type="button"
                  onClick={() => handlePopularSearch(search)}
                  className="px-3 py-1 text-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors duration-200">

                    {search}
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>);

};