
const fs = require("fs");

let details = fs.readFileSync("src/pages/maintenance/MaintenanceDetailsPage.tsx", "utf8");
const replacement = `{wo.diagnosis && <p><span className="font-medium">Diagnosis:</span> {wo.diagnosis}</p>}
                        {wo.actionTaken && <p><span className="font-medium">Action Taken:</span> {wo.actionTaken}</p>}
                        {wo.partsReplaced && <p><span className="font-medium">Parts Replaced:</span> {wo.partsReplaced}</p>}
                        {wo.repairCost !== null && wo.repairCost !== undefined && <p><span className="font-medium">Repair Cost:</span> ${"$"}{wo.repairCost.toFixed(2)}</p>}
                        {wo.resolutionNotes && <p><span className="font-medium">Notes:</span> {wo.resolutionNotes}</p>}`;

details = details.replace(
  "{wo.diagnosis && <p><span className=\"font-medium\">Diagnosis:</span> {wo.diagnosis}</p>}\n                        {wo.resolutionNotes && <p><span className=\"font-medium\">Notes:</span> {wo.resolutionNotes}</p>}",
  replacement
);

fs.writeFileSync("src/pages/maintenance/MaintenanceDetailsPage.tsx", details, "utf8");

let badge = fs.readFileSync("src/components/common/StatusBadge.tsx", "utf8");
badge = badge.replace("case \"REPORTED\":", "case \"REPORTED\":\n      case \"PENDING_ACCEPTANCE\":");
badge = badge.replace("case \"IN_PROGRESS\":", "case \"IN_PROGRESS\":\n      case \"UNDER_REVIEW\":");
badge = badge.replace("case \"REJECTED\":", "case \"REJECTED\":\n      case \"NOT_REPAIRABLE\":\n      case \"RESOLVED_RETIRED\":\n      case \"RESOLVED_REPLACED\":");
fs.writeFileSync("src/components/common/StatusBadge.tsx", badge, "utf8");

