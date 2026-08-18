package com.assetmanagement.maintenance.enums;

public enum WorkOrderStatus {

    /** Work order created and assigned to technician. */
    ASSIGNED,

    /** Work order sent to technician; awaiting their response. */
    PENDING_ACCEPTANCE,

    /** Technician accepted the work order. */
    ACCEPTED,

    /** Technician rejected the work order. */
    REJECTED,

    /** Technician is actively working on the repair. */
    IN_PROGRESS,

    /** Repair completed; asset is repairable and restored. */
    COMPLETED,

    /** Technician diagnosed the asset as not repairable. */
    NOT_REPAIRABLE
}

