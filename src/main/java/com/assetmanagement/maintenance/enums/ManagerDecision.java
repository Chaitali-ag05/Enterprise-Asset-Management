package com.assetmanagement.maintenance.enums;

public enum ManagerDecision {

    /** Retire the non-repairable asset. */
    RETIRE,

    /** Replace the non-repairable asset with a new one. */
    REPLACE,

    /** Verify and approve a successfully completed repair. */
    APPROVE_REPAIR
}
