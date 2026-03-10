from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from core.pipeline import run_agent_pipeline
import json

router = APIRouter()


@router.post("/debate")
async def stream_debate(request_body: dict, request: Request):
    """Stream agent debate as Server-Sent Events."""
    
    carriers = request_body.get("carriers", [])
    priorities = request_body.get("priorities", {})
    lane = request_body.get("lane", "Unknown")
    
    async def event_generator():
        # Run agent pipeline with correct kwargs
        try:
            async for event in run_agent_pipeline(
                carriers=carriers,
                priorities=priorities,
                lane=lane
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

