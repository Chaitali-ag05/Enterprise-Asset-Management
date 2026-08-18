package com.assetmanagement.maintenance.dto.request;

import com.assetmanagement.maintenance.enums.IssuePriority;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportIssueRequest(

        @NotNull(message = "Asset ID is required.")
        Long assetId,

        @NotNull(message = "Reporter employee ID is required.")
        @JsonAlias({"reportedById", "reportedByEmployeeId"})
        Long reportedById,

        @Size(max = 255, message = "Title cannot exceed 255 characters.")
        String title,

        @NotBlank(message = "Description is required.")
        @Size(max = 2000, message = "Description cannot exceed 2000 characters.")
        String description,

        @NotNull(message = "Priority is required.")
        IssuePriority priority

) {
        /**
         * Helper getter to resolve reportedById whether passed as reportedById or reportedByEmployeeId.
         */
        public Long getReporterId() {
                return reportedById;
        }
}
