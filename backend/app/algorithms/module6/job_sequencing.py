"""Job Sequencing with Deadlines greedy algorithm with slot allocation and timeline trace."""
from typing import Any, Dict, List, Optional, Union

Number = Union[int, float]


def get_default_jobs() -> List[Dict[str, Any]]:
    """Return standard job sequencing dataset suitable for timeline visualization."""
    return [
        {"id": "J1", "deadline": 4, "profit": 70},
        {"id": "J2", "deadline": 1, "profit": 80},
        {"id": "J3", "deadline": 1, "profit": 30},
        {"id": "J4", "deadline": 2, "profit": 100},
        {"id": "J5", "deadline": 2, "profit": 20},
    ]


def run_job_sequencing(
    jobs: Optional[List[Dict[str, Any]]] = None,
    max_slots: Optional[int] = None,
) -> Dict[str, Any]:
    """Execute Job Sequencing with Deadlines and generate a deterministic decision trace.

    Each job has 1 unit of execution duration.

    Args:
        jobs: List of dicts with 'id', 'deadline' (>=1), 'profit' (>0).
        max_slots: Optional timeline upper limit (defaults to max deadline).

    Returns:
        Dict containing:
            - steps: Chronological decision trace
            - scheduled_jobs: Ordered list of scheduled job IDs per slot
            - total_profit: Sum of profits of successfully scheduled jobs
            - max_deadline: Number of available time slots
            - sorted_jobs: Profit-sorted job sequence
            - metrics: Summary operational metrics
    """
    if jobs is None:
        jobs = get_default_jobs()

    n = len(jobs)
    if n < 1 or n > 20:
        raise ValueError("Job count must be between 1 and 20.")

    for idx, j in enumerate(jobs):
        if "id" not in j or "deadline" not in j or "profit" not in j:
            raise ValueError(f"Job at index {idx} must contain 'id', 'deadline', and 'profit'.")
        if j["deadline"] < 1:
            raise ValueError(f"Job '{j['id']}' deadline must be an integer >= 1.")
        if j["profit"] <= 0:
            raise ValueError(f"Job '{j['id']}' profit must be positive.")

    # Sort jobs in descending order of profit (standard greedy strategy)
    sorted_jobs = sorted(jobs, key=lambda x: x["profit"], reverse=True)

    # Calculate total timeline slots (1-indexed: 1..max_t)
    detected_max_deadline = max(j["deadline"] for j in sorted_jobs)
    total_slots = min(max_slots if max_slots is not None else detected_max_deadline, 15)

    # slot[t] stores job_id scheduled in slot t (1-indexed: index 0 unused or represents slot 1)
    # Using 1-based indexing for standard textbook clarity: slots 1..total_slots
    slots: List[Optional[str]] = [None] * (total_slots + 1)
    scheduled_job_ids: List[str] = []
    rejected_job_ids: List[str] = []
    running_profit = 0

    steps: List[Dict[str, Any]] = []

    def get_timeline_snapshot() -> List[Dict[str, Any]]:
        return [
            {"slot": s, "job_id": slots[s]}
            for s in range(1, total_slots + 1)
        ]

    # Step 1: Initial state
    steps.append({
        "action": "init",
        "job": None,
        "checked_slot": None,
        "timeline": get_timeline_snapshot(),
        "running_profit": 0,
        "scheduled_jobs": [],
        "rejected_jobs": [],
        "sorted_jobs": list(sorted_jobs),
        "explanation": "Initial job list received. Ready to sort by profit descending.",
        "metrics": {
            "total_profit": 0,
            "scheduled_count": 0,
            "available_slots": total_slots,
            "current_step": 1,
        },
    })

    # Step 2: Jobs sorted
    steps.append({
        "action": "sorted",
        "job": None,
        "checked_slot": None,
        "timeline": get_timeline_snapshot(),
        "running_profit": 0,
        "scheduled_jobs": [],
        "rejected_jobs": [],
        "sorted_jobs": list(sorted_jobs),
        "explanation": f"Jobs sorted by profit descending: {', '.join([j['id'] + ' ($' + str(j['profit']) + ')' for j in sorted_jobs])}.",
        "metrics": {
            "total_profit": 0,
            "scheduled_count": 0,
            "available_slots": total_slots,
            "current_step": 2,
        },
    })

    # Greedily allocate each job to the latest available slot <= deadline
    for job in sorted_jobs:
        job_id = job["id"]
        deadline = job["deadline"]
        profit = job["profit"]

        # Action: Considering job
        steps.append({
            "action": "considering",
            "job": dict(job),
            "checked_slot": None,
            "timeline": get_timeline_snapshot(),
            "running_profit": running_profit,
            "scheduled_jobs": list(scheduled_job_ids),
            "rejected_jobs": list(rejected_job_ids),
            "sorted_jobs": list(sorted_jobs),
            "explanation": f"Greedy choice: Considering job '{job_id}' (Profit: ${profit}, Deadline: {deadline}). Searching latest free slot <= {min(deadline, total_slots)}.",
            "metrics": {
                "total_profit": running_profit,
                "scheduled_count": len(scheduled_job_ids),
                "available_slots": total_slots - len(scheduled_job_ids),
                "current_step": len(steps) + 1,
            },
        })

        allocated = False
        start_slot = min(deadline, total_slots)

        for slot_idx in range(start_slot, 0, -1):
            is_occupied = slots[slot_idx] is not None

            # Action: Checking slot
            steps.append({
                "action": "checking_slot",
                "job": dict(job),
                "checked_slot": slot_idx,
                "timeline": get_timeline_snapshot(),
                "running_profit": running_profit,
                "scheduled_jobs": list(scheduled_job_ids),
                "rejected_jobs": list(rejected_job_ids),
                "sorted_jobs": list(sorted_jobs),
                "explanation": (
                    f"Checking slot {slot_idx} for '{job_id}': "
                    + (f"Slot {slot_idx} is occupied by '{slots[slot_idx]}'. Moving left..." if is_occupied else f"Slot {slot_idx} is FREE!")
                ),
                "metrics": {
                    "total_profit": running_profit,
                    "scheduled_count": len(scheduled_job_ids),
                    "available_slots": total_slots - len(scheduled_job_ids),
                    "current_step": len(steps) + 1,
                },
            })

            if not is_occupied:
                # Allocate slot
                slots[slot_idx] = job_id
                scheduled_job_ids.append(job_id)
                running_profit += profit
                allocated = True

                # Action: Assigned
                steps.append({
                    "action": "assigned",
                    "job": dict(job),
                    "checked_slot": slot_idx,
                    "timeline": get_timeline_snapshot(),
                    "running_profit": running_profit,
                    "scheduled_jobs": list(scheduled_job_ids),
                    "rejected_jobs": list(rejected_job_ids),
                    "sorted_jobs": list(sorted_jobs),
                    "explanation": f"Assigned job '{job_id}' to slot {slot_idx}. Running Profit = ${running_profit}.",
                    "metrics": {
                        "total_profit": running_profit,
                        "scheduled_count": len(scheduled_job_ids),
                        "available_slots": total_slots - len(scheduled_job_ids),
                        "current_step": len(steps) + 1,
                    },
                })
                break

        if not allocated:
            rejected_job_ids.append(job_id)
            # Action: Rejected (cannot fit before deadline)
            steps.append({
                "action": "rejected",
                "job": dict(job),
                "checked_slot": None,
                "timeline": get_timeline_snapshot(),
                "running_profit": running_profit,
                "scheduled_jobs": list(scheduled_job_ids),
                "rejected_jobs": list(rejected_job_ids),
                "sorted_jobs": list(sorted_jobs),
                "explanation": f"REJECTED: No empty slot available before deadline {deadline} for job '{job_id}'.",
                "metrics": {
                    "total_profit": running_profit,
                    "scheduled_count": len(scheduled_job_ids),
                    "available_slots": total_slots - len(scheduled_job_ids),
                    "current_step": len(steps) + 1,
                },
            })

    # Action: Completed
    steps.append({
        "action": "completed",
        "job": None,
        "checked_slot": None,
        "timeline": get_timeline_snapshot(),
        "running_profit": running_profit,
        "scheduled_jobs": list(scheduled_job_ids),
        "rejected_jobs": list(rejected_job_ids),
        "sorted_jobs": list(sorted_jobs),
        "explanation": f"Job sequencing complete! Max profit = ${running_profit}. Scheduled {len(scheduled_job_ids)} jobs: {', '.join(scheduled_job_ids)}.",
        "metrics": {
            "total_profit": running_profit,
            "scheduled_count": len(scheduled_job_ids),
            "available_slots": total_slots - len(scheduled_job_ids),
            "current_step": len(steps) + 1,
        },
    })

    return {
        "steps": steps,
        "scheduled_jobs": [slots[s] for s in range(1, total_slots + 1) if slots[s] is not None],
        "timeline": get_timeline_snapshot(),
        "total_profit": running_profit,
        "max_slots": total_slots,
        "sorted_jobs": sorted_jobs,
        "metrics": {
            "total_jobs": n,
            "scheduled_count": len(scheduled_job_ids),
            "rejected_count": len(rejected_job_ids),
            "total_profit": running_profit,
            "slots_utilized": len(scheduled_job_ids),
            "total_slots": total_slots,
            "total_steps": len(steps),
        },
    }
