export function formatDate(isoString: string | null | undefined, includeTime = false): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    
    const pref = typeof window !== "undefined" ? localStorage.getItem("dateFormat") || "YYYY-MM-DD" : "YYYY-MM-DD";

    if (pref === "DD/MM/YYYY") {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      let str = `${day}/${month}/${year}`;
      if (includeTime) {
        str += ` ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
      }
      return str;
    } else if (pref === "MM/DD/YYYY") {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      let str = `${month}/${day}/${year}`;
      if (includeTime) {
        str += ` ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
      }
      return str;
    } else {
      // Standard ISO YYYY-MM-DD
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      let str = `${year}-${month}-${day}`;
      if (includeTime) {
        str += ` ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
      }
      return str;
    }
  } catch {
    return "-";
  }
}