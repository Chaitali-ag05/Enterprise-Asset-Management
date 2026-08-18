package com.assetmanagement.maintenance.enums;

public enum IssueStatus {

    /** Employee has reported the issue; awaiting manager review. */
    REPORTED,

    /** Manager is reviewing the issue; no technician assigned yet. */
    UNDER_REVIEW,

    /** A technician has been assigned and has accepted the work order. */
    IN_PROGRESS,

    /** The most recently assigned technician rejected the work order. */
    REJECTED,

    /** Repair completed successfully; asset restored. */
    COMPLETED,

    /** Issue resolved successfully. */
    RESOLVED,

    /** Technician diagnosed the asset as beyond repair. */
    NOT_REPAIRABLE,

    /** Manager decided to retire the non-repairable asset. */
    RESOLVED_RETIRED,

    /** Manager decided to replace the non-repairable asset. */
    RESOLVED_REPLACED
}

