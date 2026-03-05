import json
from typing import Any

from prompts.itinerary_prompt import render_itinerary_prompt


def generate_itinerary(payload: dict[str, Any]) -> dict[str, Any]:
    _prompt = render_itinerary_prompt(payload)
    # Replace this fallback with a real LLM provider call.
    days = []
    per_day = round(float(payload["budget"]) / int(payload["travel_days"]), 2)
    for day in range(1, int(payload["travel_days"]) + 1):
        days.append(
            {
                "day": day,
                "summary": f"Day {day} in {payload['destination']}",
                "estimated_cost": per_day,
                "activities": [
                    {
                        "name": "City center walk",
                        "description": "Explore key landmarks and neighborhoods",
                        "category": "attraction",
                    },
                    {
                        "name": "Local lunch",
                        "description": "Try regional specialties",
                        "category": "restaurant",
                    },
                    {
                        "name": "Evening market",
                        "description": "Shopping and snacks",
                        "category": "attraction",
                    },
                ],
            }
        )

    return {"days": days, "total_estimated_cost": round(per_day * int(payload["travel_days"]), 2)}


if __name__ == "__main__":
    sample = {
        "destination": "Tokyo",
        "departure_city": "Shanghai",
        "start_date": "2026-04-10",
        "end_date": "2026-04-14",
        "travel_days": 5,
        "budget": 2500,
        "travel_style": "food",
        "travelers": 2,
    }
    print(json.dumps(generate_itinerary(sample), indent=2))
