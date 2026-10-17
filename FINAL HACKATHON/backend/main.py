from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal

app = FastAPI(
    title="Smart CPU Scheduler with Dynamic Priority Adjustment"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Process(BaseModel):
    pid: str
    arrival: int = Field(ge=0)
    burst: int = Field(gt=0)
    priority: int = Field(ge=0)


class ScheduleRequest(BaseModel):
    processes: List[Process]
    mode: Literal["preemptive", "non-preemptive"] = "preemptive"
    aging_interval: int = Field(default=3, gt=0)


@app.get("/")
def home():
    return {
        "message": "Smart CPU Scheduler Backend is Running!"
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/schedule")
def schedule(request: ScheduleRequest):
    processes = [
        process.model_dump()
        for process in request.processes
    ]

    # Handle an empty process list.
    if not processes:
        return {
            "mode": request.mode,
            "aging_interval": request.aging_interval,
            "timeline": [],
            "processes": [],
            "metrics": {
                "average_waiting": 0,
                "average_turnaround": 0,
                "average_response": 0,
                "cpu_utilization": 0,
                "throughput": 0,
            },
        }

    # Validate process IDs.
    ids = [process["pid"].strip() for process in processes]

    if any(not pid for pid in ids):
        return {"error": "Process IDs cannot be empty."}

    if len(ids) != len(set(ids)):
        return {"error": "Process IDs must be unique."}

    for process in processes:
        process["pid"] = process["pid"].strip()

    interval = request.aging_interval

    remaining = {
        process["pid"]: process["burst"]
        for process in processes
    }

    executed = {
        process["pid"]: 0
        for process in processes
    }

    first_start = {}
    completion = {}

    max_boost = {
        process["pid"]: 0
        for process in processes
    }

    priority_at_first_start = {}
    timeline = []

    time = min(process["arrival"] for process in processes)

    def calculate_priority(process, now):
        """Calculate effective priority using waiting time."""
        pid = process["pid"]

        waiting = max(
            0,
            now - process["arrival"] - executed[pid],
        )

        boost = waiting // interval

        # A smaller priority number means higher priority.
        effective = max(0, process["priority"] - boost)

        return effective

    def update_max_boost(now):
        """Track the maximum aging boost for each process."""
        for process in processes:
            pid = process["pid"]

            if (
                remaining[pid] <= 0
                or process["arrival"] > now
            ):
                continue

            effective = calculate_priority(process, now)
            boost = process["priority"] - effective

            max_boost[pid] = max(max_boost[pid], boost)

    def add_segment(pid, start, end):
        """Merge adjacent segments for the same process."""
        if end <= start:
            return

        if (
            timeline
            and timeline[-1]["pid"] == pid
            and timeline[-1]["end"] == start
        ):
            timeline[-1]["end"] = end
        else:
            timeline.append({
                "pid": pid,
                "start": start,
                "end": end,
            })

    def choose_process(ready, now):
        """Choose the ready process with highest effective priority."""
        return min(
            ready,
            key=lambda process: (
                calculate_priority(process, now),
                process["arrival"],
                process["pid"],
            ),
        )

    # Run the scheduling algorithm.
    while len(completion) < len(processes):
        update_max_boost(time)

        ready = [
            process
            for process in processes
            if (
                process["arrival"] <= time
                and remaining[process["pid"]] > 0
            )
        ]

        # If no process is ready, advance to the next arrival.
        if not ready:
            future_arrivals = [
                process["arrival"]
                for process in processes
                if (
                    remaining[process["pid"]] > 0
                    and process["arrival"] > time
                )
            ]

            if not future_arrivals:
                break

            next_arrival = min(future_arrivals)

            add_segment("IDLE", time, next_arrival)

            time = next_arrival
            update_max_boost(time)
            continue

        chosen = choose_process(ready, time)
        pid = chosen["pid"]

        if pid not in first_start:
            first_start[pid] = time

            priority_at_first_start[pid] = (
                calculate_priority(chosen, time)
            )

        # Preemptive scheduling executes one time unit at a time.
        # Non-preemptive scheduling executes the full remaining burst.
        duration = (
            1
            if request.mode == "preemptive"
            else remaining[pid]
        )

        for _ in range(duration):
            add_segment(pid, time, time + 1)

            remaining[pid] -= 1
            executed[pid] += 1
            time += 1

            update_max_boost(time)

            if remaining[pid] == 0:
                completion[pid] = time
                break

    # Calculate metrics for each process.
    results = []

    for process in processes:
        pid = process["pid"]

        turnaround = (
            completion[pid] - process["arrival"]
        )

        waiting = turnaround - process["burst"]

        response = (
            first_start[pid] - process["arrival"]
        )

        effective_at_start = priority_at_first_start[pid]

        boost_at_start = (
            process["priority"] - effective_at_start
        )

        results.append({
            "pid": pid,
            "arrival": process["arrival"],
            "burst": process["burst"],
            "priority": process["priority"],
            "completion": completion[pid],
            "waiting": waiting,
            "turnaround": turnaround,
            "response": response,
            "effective_priority": effective_at_start,
            "priority_boost": boost_at_start,
            "max_priority_boost": max_boost[pid],
            "aging_interval": interval,
        })

    # Calculate average scheduling metrics.
    count = len(results)

    average_waiting = round(
        sum(process["waiting"] for process in results)
        / count,
        2,
    )

    average_turnaround = round(
        sum(process["turnaround"] for process in results)
        / count,
        2,
    )

    average_response = round(
        sum(process["response"] for process in results)
        / count,
        2,
    )

    # Calculate CPU utilization and throughput.
    start_time = min(
        process["arrival"] for process in processes
    )

    end_time = max(
        process["completion"] for process in results
    )

    total_time = end_time - start_time

    busy_time = sum(
        process["burst"] for process in processes
    )

    cpu_utilization = (
        round((busy_time / total_time) * 100, 2)
        if total_time > 0
        else 0
    )

    throughput = (
        round(count / total_time, 2)
        if total_time > 0
        else 0
    )

    metrics = {
        "average_waiting": average_waiting,
        "average_turnaround": average_turnaround,
        "average_response": average_response,
        "cpu_utilization": cpu_utilization,
        "throughput": throughput,
    }

    return {
        "mode": request.mode,
        "aging_interval": interval,
        "timeline": timeline,
        "processes": results,
        "metrics": metrics,
    }
