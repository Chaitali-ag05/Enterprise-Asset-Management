
import os
import re

for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Revert ALL import type { ... } to import { ... }
            content = re.sub(r"import type \{", "import {", content)
            
            # Now, selectively replace type names with `type ` inside the imports
            # Types we know we need to import as types:
            types = ["AssetRequest", "AssetResponse", "AssetCategory", 
                     "VendorResponse", "EmployeeResponse", "EmployeeRequest",
                     "Designation", "DepartmentResponse", "DepartmentRequest",
                     "LoginRequest", "AuthResponse", "Role", "User", "DashboardResponse"]
                     
            for t in types:
                # Find "import { ..., T, ... }" or "import { T }" and replace T with "type T"
                # using regex lookarounds
                content = re.sub(r"(import\s+\{.*?\b)" + t + r"(\b.*?\})", r"\1type " + t + r"\2", content)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

