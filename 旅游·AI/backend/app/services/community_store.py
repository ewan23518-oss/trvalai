from app.schemas.schemas import CommunityPostCreateRequest, CommunityPostOut

_POSTS: list[CommunityPostOut] = []
_NEXT_ID = 1


def create_post(payload: CommunityPostCreateRequest) -> CommunityPostOut:
    global _NEXT_ID
    post = CommunityPostOut(
        id=_NEXT_ID,
        user_name=payload.user_name,
        title=payload.title,
        content=payload.content,
        route_summary=payload.route_summary,
        likes=0,
        favorites=0,
        comments=[],
    )
    _POSTS.append(post)
    _NEXT_ID += 1
    return post


def list_posts() -> list[CommunityPostOut]:
    return list(reversed(_POSTS))


def find_post(post_id: int) -> CommunityPostOut | None:
    for post in _POSTS:
        if post.id == post_id:
            return post
    return None


def like_post(post_id: int) -> CommunityPostOut | None:
    post = find_post(post_id)
    if post:
        post.likes += 1
    return post


def favorite_post(post_id: int) -> CommunityPostOut | None:
    post = find_post(post_id)
    if post:
        post.favorites += 1
    return post


def copy_route(post_id: int) -> dict[str, str] | None:
    post = find_post(post_id)
    if not post:
        return None
    return {"route_summary": post.route_summary}


def add_comment(post_id: int, comment: str) -> CommunityPostOut | None:
    post = find_post(post_id)
    if post:
        post.comments.append(comment)
    return post
