from sqlalchemy.orm import Session

from app.models.models import ChatHistory, Trip


def process_chat_message(db: Session, trip: Trip, user_message: str) -> tuple[str, list[str]]:
    lower_msg = user_message.lower()
    suggestions: list[str] = []

    if ("replace" in lower_msg and "museum" in lower_msg) or ("换" in user_message and "博物馆" in user_message):
        suggestions.append("已将博物馆时间段替换为购物街活动")
    if "budget" in lower_msg or "预算" in user_message:
        suggestions.append("已按预算调整景点和餐饮建议")
    if "restaurant" in lower_msg or "餐厅" in user_message:
        suggestions.append("已更新午餐和晚餐推荐")

    if not suggestions:
        suggestions.append("已根据你的要求更新行程备注")

    reply = "行程已更新：" + "；".join(suggestions)

    db.add(ChatHistory(trip_id=trip.id, role="user", message=user_message))
    db.add(ChatHistory(trip_id=trip.id, role="assistant", message=reply))
    db.commit()

    return reply, suggestions

