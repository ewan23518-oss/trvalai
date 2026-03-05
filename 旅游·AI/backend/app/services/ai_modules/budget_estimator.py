from app.schemas.schemas import BudgetEstimateRequest, BudgetEstimateResponse, BudgetItem


def _style_multiplier(style: str) -> float:
    mapping = {
        "luxury": 1.8,
        "backpacking": 0.75,
        "food": 1.2,
        "family": 1.35,
        "adventure": 1.15,
    }
    return mapping.get(style.lower(), 1.0)


def calculate_budget(payload: BudgetEstimateRequest) -> BudgetEstimateResponse:
    m = _style_multiplier(payload.travel_style)
    people = payload.travelers
    days = payload.travel_days

    flight = round((320 + days * 22) * people * m, 2)
    hotel = round((70 * m) * days * max(1, (people + 1) // 2), 2)
    food = round((35 * m) * days * people, 2)
    tickets = round((18 * m) * days * people, 2)
    transport = round((12 * m) * days * people, 2)
    misc = round((10 * m) * days * people, 2)

    items = [
        BudgetItem(category="机票", amount=flight, note="按出发城市与季节估算"),
        BudgetItem(category="酒店", amount=hotel, note="按双人间与风格系数估算"),
        BudgetItem(category="餐饮", amount=food, note="按每日三餐与风格估算"),
        BudgetItem(category="门票", amount=tickets, note="按每日1-2个付费景点估算"),
        BudgetItem(category="市内交通", amount=transport, note="地铁/公交/打车混合估算"),
        BudgetItem(category="其他", amount=misc, note="通信、保险、临时开销"),
    ]

    total = round(sum(i.amount for i in items), 2)
    daily = round(total / days, 2)
    budget_gap = None
    suggestion = "预算充足，可加入1-2个体验型项目"

    saving_tips = [
        "酒店尽量选地铁站步行10分钟内，降低打车支出",
        "餐饮可将午餐设为主餐，晚餐采用轻食策略",
        "门票优先购买联票或非高峰时段优惠票",
    ]

    if payload.total_budget is not None:
        budget_gap = round(payload.total_budget - total, 2)
        if budget_gap < 0:
            suggestion = "当前预算偏紧，建议减少酒店等级或缩减跨城移动"
            saving_tips.insert(0, "优先压缩机票和酒店档位，这两项占比最高")
        elif budget_gap < total * 0.12:
            suggestion = "预算基本匹配，建议保留10%机动费用"

    return BudgetEstimateResponse(
        destination=payload.destination,
        travel_days=days,
        travelers=people,
        travel_style=payload.travel_style,
        breakdown=items,
        estimated_total=total,
        estimated_daily_budget=daily,
        budget_gap=budget_gap,
        suggestion=suggestion,
        saving_tips=saving_tips,
    )
