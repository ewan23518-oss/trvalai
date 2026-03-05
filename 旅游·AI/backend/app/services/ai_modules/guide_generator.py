from datetime import datetime

from app.schemas.schemas import GuideGenerateRequest, GuideGenerateResponse
from app.services.ai_modules.pdf_exporter import create_pdf_file


def generate_guides(payload: GuideGenerateRequest) -> GuideGenerateResponse:
    tags = " #" + " #".join(payload.highlights) if payload.highlights else ""
    highlights_line = "、".join(payload.highlights) if payload.highlights else "城市地标与在地美食"
    title = f"{payload.destination}{payload.travel_days}天{payload.travel_style}攻略"
    route_summary = f"D1市区核心地标 -> D2文化街区 -> D3在地体验 -> D4自由探索 -> D5返程"

    xiaohongshu = (
        f"{title}。\n"
        f"预算参考：人均{payload.budget_per_person}。\n"
        f"重点体验：{highlights_line}。\n"
        "建议节奏：上午核心景点，下午街区漫游，晚上安排本地餐厅。\n"
        "评论区留“行程”可继续细化到小时级。"
        f"{tags}"
    )

    moments = (
        f"{payload.destination} {payload.travel_days}天打卡完成。"
        f"主线是{highlights_line}，整体节奏很舒服，"
        "预算可控，吃住行都在计划内，值得二刷。"
    )

    photo_suggestions = [
        "清晨地标远景（人少光线柔和）",
        "中午街区生活感抓拍（食物特写）",
        "黄昏城市天际线（广角构图）",
        "夜景与人物合影（慢门或夜景模式）",
    ]

    pdf_markdown = (
        f"# {title}\n\n"
        f"- 旅行风格：{payload.travel_style}\n"
        f"- 人均预算：{payload.budget_per_person}\n"
        f"- 核心亮点：{highlights_line}\n"
        f"- 路线摘要：{route_summary}\n"
        "- 建议携带：证件、充电器、常用药、雨具\n\n"
        "## 每日模板\n"
        "1. 上午：核心景点\n"
        "2. 中午：口碑餐厅\n"
        "3. 下午：街区或博物馆\n"
        "4. 晚上：夜景/夜市\n\n"
        "## 拍照建议\n"
        + "\n".join([f"- {x}" for x in photo_suggestions])
        + "\n\n"
        + f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}"
    )

    pdf_file_name, pdf_download_url = create_pdf_file(
        title=f"{payload.destination}{payload.travel_days}天行程单",
        content=pdf_markdown,
    )

    return GuideGenerateResponse(
        destination=payload.destination,
        title=title,
        xiaohongshu_post=xiaohongshu,
        moments_post=moments,
        route_summary=route_summary,
        photo_suggestions=photo_suggestions,
        pdf_markdown=pdf_markdown,
        pdf_file_name=pdf_file_name,
        pdf_download_url=pdf_download_url,
        video_route_script=(
            f"镜头1：到达{payload.destination}航拍；"
            "镜头2：白天景点快切；"
            "镜头3：餐厅上菜特写；"
            "镜头4：夜景收尾+预算总结。"
        ),
    )
