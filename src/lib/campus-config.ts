export const CAMPUS_CONFIG = {
  name: process.env.NEXT_PUBLIC_CAMPUS_NAME || "University Campus Central",
  portalTitle: "CampusFind",
  allowedDomains: (process.env.ALLOWED_CAMPUS_DOMAINS || "campus.edu,university.edu,college.edu,student.edu,gmail.com")
    .split(",")
    .map((d) => d.trim().toLowerCase()),
  categories: [
    { id: "Electronics", name: "Electronics & Gadgets", icon: "Laptop" },
    { id: "ID Cards", name: "Student & Faculty ID Cards", icon: "CreditCard" },
    { id: "Books and Notes", name: "Books, Notes & Documents", icon: "BookOpen" },
    { id: "Bags", name: "Backpacks & Handbags", icon: "Briefcase" },
    { id: "Stationery", name: "Stationery & Calculators", icon: "PenTool" },
    { id: "Clothing", name: "Clothing & Jackets", icon: "Shirt" },
    { id: "Accessories", name: "Watches, Glasses & Jewelry", icon: "Glasses" },
    { id: "Keys", name: "Keys & Keychains", icon: "Key" },
    { id: "Bottles", name: "Water Bottles & Flasks", icon: "CupSoda" },
    { id: "Lab Equipment", name: "Lab Coats & Equipment", icon: "FlaskConical" },
    { id: "Other", name: "Other Miscellaneous", icon: "HelpCircle" },
  ],
  locations: [
    "Central Library",
    "Engineering Block A",
    "Engineering Block B",
    "Science & Research Wing",
    "Student Center & Union",
    "Central Cafeteria & Food Court",
    "Sports Complex & Gymnasium",
    "Auditorium & Convocation Hall",
    "Hostels & Residential Halls",
    "Administrative Building",
    "Parking Lots (North/South)",
    "Campus Grounds & Quadrangle",
    "Other Campus Area",
  ],
};

export function isAllowedCampusDomain(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  
  // If allowed domains list contains "*", permit any valid email
  if (CAMPUS_CONFIG.allowedDomains.includes("*")) return true;
  
  return CAMPUS_CONFIG.allowedDomains.some((d) => domain === d || domain.endsWith("." + d));
}
