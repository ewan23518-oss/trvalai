from datetime import date

from app.schemas.schemas import AssistantAlert, AssistantContextRequest, AssistantContextResponse


def generate_assistant_alerts(payload: AssistantContextRequest) -> AssistantContextResponse:
    alerts: list[AssistantAlert] = []

    alerts.append(
        AssistantAlert(
            category="transport",
            title="地铁提醒",
            detail=f"{payload.destination} 出行建议优先 {payload.transport_mode}，避开08:30-09:30高峰。",
            severity="medium",
        )
    )

    if not payload.has_restaurant_booking:
        alerts.append(
            AssistantAlert(
                category="booking",
                title="餐厅预约提醒",
                detail="热门餐厅建议提前24小时预约，避免晚高峰排队。",
                severity="high",
            )
        )

    alerts.append(
        AssistantAlert(
            category="weather",
            title="天气提醒",
            detail=f"请在 {payload.travel_date.isoformat()} 前1天确认天气并准备雨具/防晒。",
            severity="medium",
        )
    )

    alerts.append(
        AssistantAlert(
            category="crowd",
            title="拥挤提醒",
            detail="核心景点建议开门前或闭馆前1小时到达，减少排队。",
            severity="low",
        )
    )

    return AssistantContextResponse(destination=payload.destination, alerts=alerts)
