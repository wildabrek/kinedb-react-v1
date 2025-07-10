from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query, Path, Body, Request
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import logging
import json
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_async_session
from .models import GameSession, Student, Game, GamePlay, GameImpact
from .utils import apply_game_impacts

router = APIRouter(prefix="/api/game-sync", tags=["Game Synchronization"])

logger = logging.getLogger(__name__)


# Models for request/response
class GameSessionCreate(BaseModel):
    student_id: int
    game_id: int


class GameSessionResponse(BaseModel):
    session_id: int
    student_id: int
    game_id: int
    is_started: bool = False
    created_at: datetime


class GameSessionUpdate(BaseModel):
    result_score: int
    duration: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class UISyncRequest(BaseModel):
    student_id: int
    session_id: int
    completed: Optional[bool] = False
    score: Optional[int] = None


class UISyncResponse(BaseModel):
    status: str
    data: Dict[str, Any]


class HealthResponse(BaseModel):
    status: str
    version: str
    database_connected: bool
    timestamp: datetime


# Global variable to store the latest UI sync data
current_ui_sync = {"student_id": None, "session_id": None, "completed": False, "score": None}


@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_async_session)):
    """Check the health of the game sync API"""
    try:
        # Test database connection
        await db.execute("SELECT 1")
        db_connected = True
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        db_connected = False

    return {
        "status": "ok",
        "version": "1.0.0",
        "database_connected": db_connected,
        "timestamp": datetime.utcnow()
    }


@router.post("/sessions", response_model=GameSessionResponse)
async def create_game_session(
        payload: GameSessionCreate,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_async_session)
):
    """Create a new game session"""
    try:
        # Validate student and game exist
        student = await db.get(Student, payload.student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        game = await db.get(Game, payload.game_id)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        # Check for existing active session
        existing_query = """
            SELECT session_id FROM game_sessions 
            WHERE student_id = :student_id AND game_id = :game_id AND completed = 0
        """
        result = await db.execute(existing_query, {
            "student_id": payload.student_id,
            "game_id": payload.game_id
        })
        existing = result.fetchone()

        if existing:
            # Return existing session
            session_id = existing[0]
            session = await db.get(GameSession, session_id)
            return GameSessionResponse(
                session_id=session.session_id,
                student_id=session.student_id,
                game_id=session.game_id,
                is_started=session.is_started,
                created_at=session.created_at
            )

        # Create new session
        new_session = GameSession(
            student_id=payload.student_id,
            game_id=payload.game_id,
            is_started=False,
            completed=False,
            created_at=datetime.utcnow()
        )
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)

        logger.info(f"Created new game session: {new_session.session_id} for student {payload.student_id}")

        return GameSessionResponse(
            session_id=new_session.session_id,
            student_id=new_session.student_id,
            game_id=new_session.game_id,
            is_started=new_session.is_started,
            created_at=new_session.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating game session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create game session: {str(e)}")


@router.post("/sessions/{session_id}/start")
async def start_game_session(
        session_id: int = Path(...),
        db: AsyncSession = Depends(get_async_session)
):
    """Mark a game session as started"""
    try:
        session = await db.get(GameSession, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if session.completed:
            raise HTTPException(status_code=400, detail="Session already completed")

        session.is_started = True
        session.start_time = datetime.utcnow()
        await db.commit()

        logger.info(f"Started game session: {session_id}")

        return {"status": "started", "session_id": session_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting game session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start game session: {str(e)}")


@router.post("/sessions/{session_id}/end")
async def end_game_session(
        session_id: int = Path(...),
        payload: GameSessionUpdate = Body(...),
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_async_session)
):
    """End a game session and record the results"""
    try:
        session = await db.get(GameSession, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if session.completed:
            raise HTTPException(status_code=400, detail="Session already completed")

        # Update session
        session.completed = True
        session.result_score = payload.result_score
        session.end_time = datetime.utcnow()

        if payload.duration:
            session.duration = payload.duration
        elif session.start_time:
            # Calculate duration if not provided
            delta = session.end_time - session.start_time
            session.duration = delta.total_seconds()

        if payload.metadata:
            session.metadata = json.dumps(payload.metadata)

        await db.commit()

        # Create game play record
        game_play = GamePlay(
            game_id=session.game_id,
            student_id=session.student_id,
            score=payload.result_score,
            played_at=datetime.utcnow()
        )
        db.add(game_play)
        await db.commit()

        # Get game name for impact processing
        game = await db.get(Game, session.game_id)
        if game:
            # Process game impacts in background
            background_tasks.add_task(
                apply_game_impacts,
                session.student_id,
                game.game_name,
                payload.result_score
            )

        logger.info(f"Ended game session: {session_id} with score: {payload.result_score}")

        return {
            "status": "completed",
            "session_id": session_id,
            "score": payload.result_score
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending game session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to end game session: {str(e)}")


@router.get("/sessions/next")
async def get_next_session(
        game_id: int = Query(...),
        db: AsyncSession = Depends(get_async_session)
):
    """Get the next pending game session for a specific game"""
    try:
        # Find the next pending session
        query = """
            SELECT gs.* 
            FROM game_sessions gs
            WHERE gs.game_id = :game_id 
            AND gs.is_started = 0 
            AND gs.completed = 0
            ORDER BY gs.created_at ASC
            LIMIT 1
        """
        result = await db.execute(query, {"game_id": game_id})
        session = result.fetchone()

        if not session:
            return None

        return {
            "session_id": session.session_id,
            "game_id": session.game_id,
            "student_id": session.student_id,
            "is_active": False,
            "is_started": session.is_started
        }

    except Exception as e:
        logger.error(f"Error getting next session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get next session: {str(e)}")


@router.post("/ui-sync")
async def sync_ui_status(payload: UISyncRequest):
    """Sync UI status between Unity and web interface"""
    global current_ui_sync

    # Update the global UI sync data
    current_ui_sync["student_id"] = payload.student_id
    current_ui_sync["session_id"] = payload.session_id

    if payload.completed is not None:
        current_ui_sync["completed"] = payload.completed

    if payload.score is not None:
        current_ui_sync["score"] = payload.score

    logger.info(f"UI Sync updated: {current_ui_sync}")

    return {
        "status": "ok",
        "data": current_ui_sync
    }


@router.get("/ui-sync-status")
async def get_ui_sync_status():
    """Get the current UI sync status"""
    return current_ui_sync


@router.get("/sessions/{session_id}")
async def get_session_status(
        session_id: int = Path(...),
        db: AsyncSession = Depends(get_async_session)
):
    """Get the status of a specific game session"""
    try:
        session = await db.get(GameSession, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "session_id": session.session_id,
            "game_id": session.game_id,
            "student_id": session.student_id,
            "is_started": session.is_started,
            "completed": session.completed,
            "result_score": session.result_score,
            "created_at": session.created_at,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "duration": session.duration
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get session status: {str(e)}")


@router.get("/sessions")
async def list_game_sessions(
        game_id: Optional[int] = Query(None),
        student_id: Optional[int] = Query(None),
        completed: Optional[bool] = Query(None),
        limit: int = Query(50, ge=1, le=100),
        db: AsyncSession = Depends(get_async_session)
):
    """List game sessions with optional filtering"""
    try:
        query = "SELECT * FROM game_sessions WHERE 1=1"
        params = {}

        if game_id is not None:
            query += " AND game_id = :game_id"
            params["game_id"] = game_id

        if student_id is not None:
            query += " AND student_id = :student_id"
            params["student_id"] = student_id

        if completed is not None:
            query += " AND completed = :completed"
            params["completed"] = completed

        query += " ORDER BY created_at DESC LIMIT :limit"
        params["limit"] = limit

        result = await db.execute(query, params)
        sessions = result.fetchall()

        return [
            {
                "session_id": session.session_id,
                "game_id": session.game_id,
                "student_id": session.student_id,
                "is_started": session.is_started,
                "completed": session.completed,
                "result_score": session.result_score,
                "created_at": session.created_at
            }
            for session in sessions
        ]

    except Exception as e:
        logger.error(f"Error listing game sessions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list game sessions: {str(e)}")
