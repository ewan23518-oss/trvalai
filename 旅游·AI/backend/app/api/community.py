from fastapi import APIRouter, HTTPException, status

from app.schemas.schemas import (
    CommunityCommentRequest,
    CommunityPostCreateRequest,
    CommunityPostOut,
)
from app.services.community_store import (
    add_comment,
    copy_route,
    create_post,
    favorite_post,
    like_post,
    list_posts,
)

router = APIRouter(prefix="/community", tags=["community"])


@router.post("/posts", response_model=CommunityPostOut, status_code=status.HTTP_201_CREATED)
def create_community_post(payload: CommunityPostCreateRequest) -> CommunityPostOut:
    return create_post(payload)


@router.get("/posts", response_model=list[CommunityPostOut])
def get_community_posts() -> list[CommunityPostOut]:
    return list_posts()


@router.post("/posts/{post_id}/like", response_model=CommunityPostOut)
def like_community_post(post_id: int) -> CommunityPostOut:
    post = like_post(post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("/posts/{post_id}/favorite", response_model=CommunityPostOut)
def favorite_community_post(post_id: int) -> CommunityPostOut:
    post = favorite_post(post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("/posts/{post_id}/copy-route")
def copy_community_route(post_id: int) -> dict[str, str]:
    copied = copy_route(post_id)
    if not copied:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return copied


@router.post("/posts/{post_id}/comments", response_model=CommunityPostOut)
def comment_community_post(post_id: int, payload: CommunityCommentRequest) -> CommunityPostOut:
    post = add_comment(post_id, payload.comment)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post
