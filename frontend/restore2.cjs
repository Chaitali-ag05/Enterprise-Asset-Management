
const fs = require("fs");
const file = "src/pages/assets/AssetFormPage.tsx";
let content = fs.readFileSync(file, "utf8");

const startIdx = content.indexOf("const handleChange");
const endIdx = content.indexOf("<div className=\"flex items-center gap-4\">");

if (startIdx !== -1 && endIdx !== -1) {
    const fixedPart = `const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? null : Number(value)
    }));
  };

  if (loading) {
    return <LoadingState minHeight="min-h-[256px]" />;
  }

  const isRetired = originalAsset?.status === "RETIRED";
  const activeVendors = vendors.filter(v => v.status === "ACTIVE");
  
  // Categories matching backend enum
  const categories: AssetCategory[] = [
    "LAPTOP", "DESKTOP", "MONITOR", "PRINTER", "MOBILE", "TABLET", "NETWORK_DEVICE", "OTHER"
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      `;
    
    content = content.substring(0, startIdx) + fixedPart + content.substring(endIdx);
    fs.writeFileSync(file, content, "utf8");
    console.log("Restored successfully via substring");
} else {
    console.log("Indexes not found");
}

