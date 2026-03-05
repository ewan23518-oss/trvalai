from textwrap import dedent


def itinerary_prompt_template() -> str:
    return dedent(
        """
        You are an expert travel planner.
        Return only valid JSON matching this schema:
        {
          "days": [
            {
              "day": 1,
              "summary": "short day summary",
              "estimated_cost": 120,
              "activities": [
                {"name": "Visit attraction", "description": "...", "category": "attraction"},
                {"name": "Lunch recommendation", "description": "...", "category": "restaurant"}
              ]
            }
          ],
          "total_estimated_cost": 600
        }

        Constraints:
        - Use destination-aware places.
        - Respect budget, style, and number of travelers.
        - Include 3-5 activities per day with at least one restaurant.
        - Keep language concise and actionable.

        User input:
        destination={destination}
        departure_city={departure_city}
        start_date={start_date}
        end_date={end_date}
        travel_days={travel_days}
        budget={budget}
        travel_style={travel_style}
        travelers={travelers}
        """
    ).strip()


def render_itinerary_prompt(payload: dict) -> str:
    return itinerary_prompt_template().format(**payload)
