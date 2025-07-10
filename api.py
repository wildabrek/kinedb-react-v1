import random
import re
import sys
from decimal import Decimal

from fastapi import FastAPI, HTTPException, Body, Path, Query, Form,Request, Depends, WebSocket, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from flask import g
from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional, Union, Any
import os
import sqlalchemy
import databases
from datetime import datetime, timedelta
from sqlalchemy import desc, join, select, func
from sqlalchemy import text
from passlib.hash import bcrypt

from sqlalchemy.cyextension.processors import datetime_cls
import logging
import uvicorn
import sqlite3
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import json # Added for safe_json_parse

# ------------------------------------------------------------------------------
# Database configuration & reflection
# ------------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kinekids.db")
database = databases.Database(DATABASE_URL)
engine = sqlalchemy.create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
metadata = sqlalchemy.MetaData()
metadata.reflect(engine)

# Table refs (must match exactly your SQL names)
users_table                        = metadata.tables["Users"]
subjects_table                     = metadata.tables["Subjects"]
skills_table                       = metadata.tables["Skills"]
schools_table                      = metadata.tables["Schools"]
teachers_table                     = metadata.tables["Teachers"]
classes_table                      = metadata.tables["Classes"]
class_recent_games_table           = metadata.tables["ClassRecentGames"]
students_table                     = metadata.tables["Students"]
strengths_table                    = metadata.tables["Strengths"]
development_areas_table            = metadata.tables["DevelopmentAreas"]
student_strengths_table            = metadata.tables["StudentStrengths"]
student_development_areas_table    = metadata.tables["StudentDevelopmentAreas"]
games_table                        = metadata.tables["Games"]
game_skills_table                  = metadata.tables["GameSkills"]
game_target_skills_table           = metadata.tables["GameTargetSkills"]
game_target_subjects_table         = metadata.tables["GameTargetSubjects"]
short_term_goals_table             = metadata.tables["ShortTermGoals"]
medium_term_goals_table            = metadata.tables["MediumTermGoals"]
long_term_goals_table              = metadata.tables["LongTermGoals"]
student_recommended_games_table    = metadata.tables["StudentRecommendedGames"]
monthly_progress_table             = metadata.tables["MonthlyProgress"]
student_game_performances_table    = metadata.tables["StudentGamePerformances"]
student_badges_table               = metadata.tables["StudentBadges"]
student_skills_table               = metadata.tables["StudentSkills"]
student_subject_scores_table       = metadata.tables["StudentSubjectScores"]
game_plays_table                   = metadata.tables["GamePlays"]
recent_activities_table            = metadata.tables["RecentActivities"]
recent_players_table               = metadata.tables["RecentPlayers"]
top_performers_table               = metadata.tables["TopPerformers"]
dashboard_stats_table              = metadata.tables["DashboardStats"]
projects_table                     = metadata.tables["Projects"]
game_impacts_table                 = metadata.tables["GameImpacts"]
possible_areas_table               = metadata.tables["PossibleAreas"]
possible_strengths_table           = metadata.tables["PossibleStrengths"]
game_sessions_table                = metadata.tables["game_sessions"] # Added game_sessions_table
ui_sync_status_table               = metadata.tables["UISyncStatus"] # Added ui_sync_status_table
student_action_plans_table         = metadata.tables["StudentActionPlans"] # Added student_action_plans_table
performance_scores_table           = metadata.tables["performance_scores"] # Added performance_scores_table
suggested_action_templates_table   = metadata.tables["SuggestedActionTemplates"] # Added suggested_action_templates_table


def get_db() -> sqlite3.Connection:
    if 'db' not in g:
        g.db = sqlite3.connect("kinekids.db")
        g.db.row_factory = sqlite3.Row  # Sonuçları sözlük gibi kullanmamıza olanak tanır
    return g.db

def query_db(query: str, args: Union[List[Any], tuple] = (), one: bool = False) -> Union[dict, List[dict], None]:
    """Verilen SQL sorgusunu çalıştırır ve sonucu dict formatında döner"""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    result = [dict(row) for row in rv]

    if one:
        return result[0] if result else None
    return result
# ------------------------------------------------------------------------------
# FastAPI setup
# ------------------------------------------------------------------------------
app = FastAPI(title="KineDB API", description="Complete CRUD for all resources")

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s [%(processName)s: %(process)d] [%(threadName)s: %(thread)d] [%(levelname)s] %(name)s: %(message)s")

stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(formatter)
file_handler = logging.FileHandler("info.log")
file_handler.setFormatter(formatter)

logger.addHandler(stream_handler)
logger.addHandler(file_handler)

logger.info('API is starting up')


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------------------------------------------------------------------
# Pydantic models for every table
# ------------------------------------------------------------------------------

class User(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    first_name: str
    last_name: str
    status: str
    profile_image: Optional[str] = None

class Subject(BaseModel):
    subject_id: int
    name: str
    description: Optional[str] = None
    grade_level: Optional[str] = None
    curriculum_area: Optional[str] = None
    icon: Optional[str] = None

class Skill(BaseModel):
    skill_id: int
    name: str
    description: Optional[str] = None
    subject_id: Optional[int] = None
    level: Optional[str] = None
    prerequisite_skill_id: Optional[int] = None
    taxonomy: Optional[str] = None

class School(BaseModel):
    school_id: int
    school_name: str
    city: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

class SchoolCreate(BaseModel):
    school_name: str
    city: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = "Active"  # Default olarak Active olsun

class ClassCreate(BaseModel):
    class_name: str
    grade_level: Optional[str] = None
    description: Optional[str] = None
    schedule: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "Active"
    teacher_id: int
    school_id: int

class Teacher(BaseModel):
    teacher_id: str #int
    first_name: Optional[str] = None #str
    last_name: Optional[str] = None #str
    email: Optional[str] = None #str
    status: Optional[str] = None
    school_id: int
    user_id: Optional[int] = None

class TeacherCreate(BaseModel):
    teacher_id: str
    first_name: str
    last_name: str
    email: EmailStr # Made required and validated as email
    status: Optional[str] = "Active"
    school_id: int

class StudentListItem(BaseModel):
    id: int
    name: str
    grade: str
    avgScore: float

class RecentGame(BaseModel):
    id: int
    name: str
    date: datetime
    avgScore: float

class Class(BaseModel):
    class_id: int
    class_name: str
    grade_level: Optional[str] = None
    description: Optional[str] = None
    schedule: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    teacher_id: int
    school_id: int
    last_active: Optional[datetime] = None       # ← was str
    students: Optional[int] = None
    avgScore: Optional[float] = None
    gamesPlayed: Optional[int] = None
    studentList: Optional[List[StudentListItem]] = None
    recentGames: Optional[List[RecentGame]] = None        # ← now required

class Student(BaseModel):
    student_internal_id: str #int
    student_external_id: Optional[str] = None
    name: Optional[str] = None #str
    email: Optional[str] = None #str
    grade: Optional[str] = None #str
    avatar: Optional[str] = None
    status: Optional[str] = None
    join_date: Optional[datetime] = None
    avg_score: Optional[float] = None
    avg_time_per_session: Optional[str] = None
    last_active: Optional[datetime] = None
    phone: Optional[str] = None
    progress_status: Optional[str] = None
    class_id: int
    games_played: Optional[int] = None
    user_id: Optional[int] = None
    school_id: int
    notes: Optional[str] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        orm_mode = True

# --- end of part 1/6 ---
# api.py (part 2/6: lines 201–400)

class TeacherStatusUpdate(BaseModel):
    status: str

class Strength(BaseModel):
    strength_id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None

class DevelopmentArea(BaseModel):
    area_id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None

class StudentStrength(BaseModel):
    id: int
    student_id: int
    strength_id: int
    level: int
    notes: Optional[str] = None

class StudentDevelopmentArea(BaseModel):
    id: int
    student_id: int
    area_id: int
    priority: int
    notes: Optional[str] = None
    improvement_plan: Optional[str] = None

class Game(BaseModel):
    game_id: int
    game_name: str
    subject: Optional[str] = None
    level: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    creator: Optional[str] = None
    last_updated: Optional[datetime] = None
    plays: Optional[int] = None
    avg_score: Optional[float] = None
    avg_time: Optional[str] = None
    difficulty_level: Optional[int] = None
    age_range: Optional[str] = None
    thumbnail_url: Optional[str] = None
    time_limit: Optional[int] = None
    points_per_question: Optional[int] = None

    class Config:
        orm_mode = True


class GameSkill(BaseModel):
    id: int
    game_id: int
    skill: str

class GameImpact(BaseModel):
    game_name: str
    main_subject: str
    subjects_boost: Dict[str, float]
    skills_boost: Dict[str, float]
    add_strengths: List[str]
    add_areas_on_low_score: List[str]
    recommendations: List[str]
    difficulty_level: Optional[str] = None
    recomended_age: Optional[str] = None
    time_to_complete: Optional[str] = None
    additional_notes: Optional[str] = None

class GameImpactCreate(BaseModel):
    game_name: str
    main_subject: str
    difficulty_level: Optional[str] = None
    recomended_age: Optional[str] = None
    time_to_complete: Optional[str] = None
    additional_notes: Optional[str] = None

    subjects_boost: Dict[str, int] = Field(default_factory=dict)
    skills_boost: Dict[str, int] = Field(default_factory=dict)

    add_strengths: List[str] = Field(default_factory=list)
    add_areas_on_low_score: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class PossibleArea(BaseModel):
    id: str
    label: str
    description: str

class PossibleStrength(BaseModel):
    id: str
    label: str
    description: str


class GamePlayRecord(BaseModel):
    game_id: int = Field(..., alias="gameId")
    student_id: int = Field(..., alias="studentId")
    score: int
    played_at: Optional[datetime] = Field(None, alias="date")
    details: Optional[str] = None

    class Config:
        allow_population_by_field_name = True

class GameTargetSkill(BaseModel):
    id: int
    game_id: int
    skill_id: int
    primary_focus: Optional[bool] = None
    weight: Optional[int] = None

class GameTargetSubject(BaseModel):
    id: int
    game_id: int
    subject_id: int
    primary_focus: Optional[bool] = None
    weight: Optional[int] = None

class ShortTermGoal(BaseModel):
    goal_id: int
    student_id: int
    title: str
    description: Optional[str] = None
    created_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    skill_id: Optional[int] = None
    subject_id: Optional[int] = None
    notes: Optional[str] = None
    created_by: Optional[int] = None

class MediumTermGoal(BaseModel):
    goal_id: int
    student_id: int
    title: str
    description: Optional[str] = None
    created_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    skill_id: Optional[int] = None
    subject_id: Optional[int] = None
    notes: Optional[str] = None
    related_short_term_goals: Optional[List[int]] = None
    created_by: Optional[int] = None

class LongTermGoal(BaseModel):
    goal_id: int
    student_id: int
    title: str
    description: Optional[str] = None
    created_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    skill_id: Optional[int] = None
    subject_id: Optional[int] = None
    notes: Optional[str] = None
    related_medium_term_goals: Optional[List[int]] = None
    created_by: Optional[int] = None

class StudentRecommendedGame(BaseModel):
    id: int
    student_id: int
    game_id: int
    recommendation_date: Optional[datetime] = None
    reason: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None
    recommended_by: Optional[int] = None
    target_skill_id: Optional[int] = None
    target_area_id: Optional[int] = None

class MonthlyProgress(BaseModel):
    id: int
    student_id: int
    month: int
    year: int
    overall_score: Optional[float] = None
    games_played: Optional[int] = None
    total_time_spent: Optional[int] = None
    improvement_percentage: Optional[float] = None
    notes: Optional[str] = None
    teacher_feedback: Optional[str] = None
    strengths: Optional[List[str]] = None
    areas_for_improvement: Optional[List[str]] = None

class StudentGamePerformance(BaseModel):
    id: int
    student_id: int
    game_id: int
    play_date: Optional[datetime] = None
    score: Optional[float] = None
    duration: Optional[int] = None
    completion_status: Optional[str] = None
    difficulty_level: Optional[int] = None
    mistakes_made: Optional[int] = None
    hints_used: Optional[int] = None
    skills_demonstrated: Optional[List[int]] = None
    areas_for_improvement: Optional[List[int]] = None

class StudentBadge(BaseModel):
    id: int
    student_id: int
    badge: str

class StudentSkill(BaseModel):
    id: int
    student_id: int
    skill: str
    is_strength: bool

class StudentSubjectScore(BaseModel):
    id: int
    student_id: int
    subject: str
    score: float

class GamePlay(BaseModel):
    id: Optional[int]
    game_id: int = Field(..., alias="game_id")
    student_id: int = Field(..., alias="student_id")
   # game_name : Optional[str] = None
   # student_name: Optional[str] = None
    score: float
    playedAt: datetime = Field(..., alias="played_at")

    class Config:
        allow_population_by_field_name = True

class GamePlayCreate(BaseModel):
    game_id: int
    student_id: int
    score: float
    played_at: datetime
    #game_name: str
    #student_name: str

class RecentActivity(BaseModel):
    id: int
    type: str
    title: str
    description: Optional[str] = None
    time: Optional[str] = None

class RecentPlayer(BaseModel):
    id: int
    game_id: int
    student_id: int
    score: float
    played_at: Optional[datetime] = Field(None, alias="date")

class TopPerformer(BaseModel):
    id: int
    student_id: int
    subject: str
    score: float

class DashboardStats(BaseModel):
    id: int
    total_students: Optional[int] = None
    new_students_this_week: Optional[int] = None
    total_classes: Optional[int] = None
    active_classes: Optional[int] = None
    total_games: Optional[int] = None
    new_games: Optional[int] = None
    average_score: Optional[float] = None
    score_change_percentage: Optional[float] = None
    student_count: Optional[int] = None
    school_count: Optional[int] = None
    class_count: Optional[int] = None
    game_count: Optional[int] = None
    timestamp: Optional[str]  # ISO string olacak

    class Config:
        orm_mode = True

class Project(BaseModel):
    id: int
    name: str
    students: Optional[int] = None
    completion: Optional[int] = None
    avg_score: Optional[float] = None


class StudentCreate(BaseModel):
    student_internal_id: str # UUID olarak gelecek
    class_id: int
    school_id: int
    status: Optional[str] = "Active"
    #name: str
    #grade: str
    #class_id: int

# ---------------------------  APPLY GAME IMPACTS

async def apply_game_impacts(student_id: int, game_name: str, score: float):
    logger.info(f"Applying impacts for student {student_id} on game '{game_name}' with score {score}")

    game_impact_row = await database.fetch_one("SELECT * FROM GameImpacts WHERE game_name = :name", {"name": game_name})
    if not game_impact_row:
        return

    # JSON alanlarını çöz
    try:
        row = dict(game_impact_row)  # 🔥 en kritik satır

        subjects_boost = safe_json_parse(row.get("subjects_boost"), {})
        skills_boost = safe_json_parse(row.get("skills_boost"), {})
        add_strengths = safe_json_parse(row.get("add_strengths"), [])
        add_areas_on_low_score = safe_json_parse(row.get("add_areas_on_low_score"), [])
        recommendations = safe_json_parse(row.get("recommendations"), [])

        print("Recommendations:" + str(recommendations))
        print("Subject Boosts:" + str(subjects_boost))
        print("Skills Boosts:" + str(skills_boost))
        print("Add Strengths:" + str(add_strengths))
        print("Add Areas on Low Score:" + str(add_areas_on_low_score))

    except Exception as e:
        logger.error(f"Game impact JSON parse hatası: {e}")
        return
    # Strength ekle
    if score >= 65:
        for sid in add_strengths:
            # Strength zaten ekli mi?
            existing = await database.fetch_one(
                "SELECT 1 FROM studentstrengths WHERE student_id = :sid AND strength_id = :strength_id",
                {"sid": student_id, "strength_id": int(sid)}
            )
            if not existing:
                # Strength EKLE
                await database.execute(
                    "INSERT INTO studentstrengths (student_id, strength_id, level, notes) VALUES (:sid, :strength_id, 1, :note)",
                    {
                        "sid": student_id,
                        "strength_id": int(sid),
                        "note": f"High score in {game_name}"
                    }
                )

        # Bu oyunla ilişkilendirilmiş tüm areas silinsin
        if add_areas_on_low_score:
            for aid in add_areas_on_low_score:
                await database.execute(
                    "DELETE FROM studentdevelopmentareas WHERE student_id = :sid AND area_id = :aid",
                    {"sid": student_id, "aid": int(aid)}
                )
            logger.info(f"Removed areas {add_areas_on_low_score} due to high score in {game_name}")

    # Area ekle
    if score < 65:
        for aid in add_areas_on_low_score:
            existing = await database.fetch_one(
                "SELECT 1 FROM studentdevelopmentareas WHERE student_id = :sid AND area_id = :aid",
                {"sid": student_id, "aid": int(aid)}
            )
            if not existing:
                await database.execute(
                    "INSERT INTO studentdevelopmentareas (student_id, area_id, priority, notes) VALUES (:sid, :aid, 1, :note)",
                    {"sid": student_id, "aid": int(aid), "note": f"Low score in {game_name}"}
                )

        # Düşük skor → strength'leri sil
        if add_strengths:
            for sid in add_strengths:
                await database.execute(
                    "DELETE FROM studentstrengths WHERE student_id = :sid AND strength_id = :strength_id",
                    {"sid": student_id, "strength_id": int(sid)}
                )
            logger.info(f"Removed strengths {add_strengths} due to low score in {game_name}")

    # Subject boost
    for subj, boost in subjects_boost.items():
        subj_score_row = await database.fetch_one(
            "SELECT score FROM studentsubjectscores WHERE student_id = :sid AND subject = :subj",
            {"sid": student_id, "subj": subj}
        )

        current = subj_score_row["score"] if subj_score_row else 65
        new_score = max(0, min(round(int(current or 0) + boost), 100))


        if subj_score_row:
            # kayıt varsa: güncelle
            await database.execute(
                "UPDATE studentsubjectscores SET score = :score WHERE student_id = :sid AND subject = :subj",
                {"sid": student_id, "subj": subj, "score": new_score}
            )
        else:
            # kayıt yoksa: ekle
            await database.execute(
                "INSERT INTO studentsubjectscores (student_id, subject, score) VALUES (:sid, :subj, :score)",
                {"sid": student_id, "subj": subj, "score": new_score}
            )

    # Skill boost
    for skill, base_boost in skills_boost.items():
        boost = round(base_boost)
        existing_row = await database.fetch_one(
            "SELECT score FROM studentskills WHERE student_id = :sid AND skill = :skill",
            {"sid": student_id, "skill": skill}
        )

        if existing_row:
            current_score = existing_row["score"] or 65
            new_score = max(0, min(round(int(current_score or 0) + boost), 100))
            if new_score != current_score:
                await database.execute(
                    "UPDATE studentskills SET score = :score, is_strength = false WHERE student_id = :sid AND skill = :skill",
                    {"sid": student_id, "skill": skill, "score": new_score}
                )
                logger.info(f"Skill '{skill}' updated: {current_score} -> {new_score} (boost: {boost})")
        else:
            initial_score = 65 if boost >= 0 else 50
            new_score = max(0, min(round(initial_score + boost), 100))
            await database.execute(
                "INSERT INTO studentskills (student_id, skill, score, is_strength) VALUES (:sid, :skill, :score, false)",
                {"sid": student_id, "skill": skill, "score": new_score}
            )
            logger.info(f"Skill '{skill}' inserted with initial score {new_score} (boost: {boost})")

    student_row = await database.fetch_one("SELECT name FROM students WHERE student_internal_id = :sid",
                                           {"sid": student_id})
    student_name = student_row["name"] if student_row else f"Student {student_id}"
    student_avg = await database.fetch_one("SELECT avg_score FROM students WHERE student_internal_id = :sid",
                                           {"sid": student_id})
    await database.execute(
        """
        INSERT INTO RecentActivities (type, title, description, time)
        VALUES (:type, :title, :description, :time)
        """,
        {
            "type": "game",
            "title": f"{game_name} played",
            "description": f"Student {student_id} played {game_name}",
            "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
    )

    # Oyun önerileri (Recommendation)
    if score <= student_avg["avg_score"]:
        for reco in recommendations:
            game_row = await database.fetch_one(
                "SELECT game_id FROM games WHERE game_name = :name", {"name": reco}
            )
            if game_row:
                reason =""
                if score <= 75:
                    reason = "Low score in"
                else:
                    reason = "High score in"

                existing = await database.fetch_val(
                    """
                    SELECT 1 FROM studentrecommendedgames 
                    WHERE student_id = :sid AND game_id = :gid
                    """,
                    {"sid": student_id, "gid": game_row["game_id"]}
                )

                if not existing:
                    await database.execute(
                        """
                        INSERT INTO studentrecommendedgames 
                        (student_id, game_id, recommendation_date, reason) 
                        VALUES (:sid, :gid, :ts, :reason)
                        """,
                        {
                            "sid": student_id,
                            "gid": game_row["game_id"],
                            "ts": datetime.utcnow(),
                            "reason": f"{reason} {game_name}"
                        }
                    )

                # existing = await database.fetch_one(
                #     "SELECT 1 FROM studentrecommendedgames WHERE student_id = :sid AND game_id = :gid",
                #     {"sid": student_id, "gid": game_row["game_id"]}
                # )
                # if not existing:
                #
    # Recent activity kaydı ekle


    if score >= student_avg["avg_score"]:
        await database.execute(
            """
            INSERT INTO RecentActivities (type, title, description, time)
            VALUES (:type, :title, :description, :time)
            """,
            {
                "type": "achievement",
                "title": "Badge Earned",
                "description": f"Student {student_id} earned {game_name} badge",
                "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            }
        )
        badge_check = await database.fetch_one("SELECT * FROM StudentBadges WHERE student_id = :sid and badge= :game_name", {"sid": student_id, "game_name": game_name})
        if not badge_check:
            await database.execute(
                """
                INSERT INTO StudentBadges (student_id, badge)
                VALUES (:student_id, :badge)
                """,
                {
                    "student_id": student_id,
                    "badge": game_name

                }
            )
    await database.execute(
        "UPDATE Students SET last_active = :time WHERE student_internal_id = :sid",
        {"sid": student_id, "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}
    )
    status = "Need Support"
    if score >= student_avg["avg_score"]:
        status = "Advanced"
    if score <= student_avg["avg_score"] and (score >= 40):
        status = "On Track"
    if score < 40:
        status = "Need Support"

    await database.execute(
        "UPDATE Students SET progress_status = :status WHERE student_internal_id = :sid",
        {"status": status, "sid": student_id}
    )

    # 🎯 Suggested Action Plan otomatik oluştur
    skills = await database.fetch_all("SELECT skill, score FROM studentskills WHERE student_id = :sid",
                                      {"sid": student_id})
    games = await database.fetch_all(
        "SELECT game_id, score FROM gameplays WHERE student_id = :sid ORDER BY played_at DESC LIMIT 10",
        {"sid": student_id})
    game_names = {
        row["game_id"]: row["game_name"]
        for row in await database.fetch_all("SELECT game_id, game_name FROM games")
    }

    templates = await database.fetch_all("SELECT * FROM SuggestedActionTemplates")
    for template in templates:
        condition = template["condition"]
        goal = template["goal"]
        t_type = template["type"]

        if ":" in condition and "<" in condition:
            field, threshold_str = condition.split("<", 1)
            if ":" not in field:
                continue  # geçersiz format

            category, key = field.split(":", 1)
            threshold = int(threshold_str)

            matched = False
            if category == "skill":
                matched = any(s["skill"] == key and int(s["score"]) < threshold for s in skills)
            elif category == "game":
                matched = any(
                    game_names.get(g["game_id"]) == key and int(g["score"]) < threshold for g in games
                )

            if matched:
                # EXISTS kontrolü
                exists = await database.fetch_one(
                    "SELECT 1 FROM StudentActionPlans WHERE student_id = :sid AND goal = :goal",
                    {"sid": student_id, "goal": goal}
                )
                if not exists:
                    await database.execute(
                        "INSERT INTO StudentActionPlans (student_id, type, goal) VALUES (:sid, :type, :goal)",
                        {"sid": student_id, "type": t_type, "goal": goal}
                    )

        # 🎯 Tamamlanan Action Plan'ları güncelle
        for template in templates:
            target_cond = template["target_condition"] if "target_condition" in template else None

            if not target_cond:
                continue

            if ":" in target_cond and ">" in target_cond:
                field, threshold_str = target_cond.split(">", 1)
                if ":" not in field:
                    continue
                category, key = field.split(":", 1)
                threshold = int(threshold_str)

                matched = False
                if category == "game" and game_name == key and score > threshold:
                    matched = True

                if matched:
                    # Bu goal varsa → tamamlandı olarak güncelle
                    await database.execute(
                        """
                        UPDATE StudentActionPlans 
                        SET status = 'completed' 
                        WHERE student_id = :sid AND goal = :goal
                        """,
                        {"sid": student_id, "goal": template["goal"]}
                    )

    game_rowid = await database.fetch_one(
        "SELECT game_id FROM games WHERE game_name = :name", {"name": game_name}
    )
    await database.execute(
        """
        INSERT INTO studentgameperformances (student_id, game_id, score, play_date)
        VALUES (:sid, :gid, :score, :play_date)
        """,
        {
            "sid": student_id,
            "gid": game_rowid["game_id"],  # bu zaten yukarıda bulundu
            "score": score,
            "play_date": datetime.utcnow().strftime("%Y-%m-%d")
        }
    )


@app.get("/students/{student_id}/action-plans")
async def get_student_action_plans(student_id: int):
    query = """
        SELECT type, goal, status
        FROM StudentActionPlans
        WHERE student_id = :student_id
        ORDER BY
          CASE type
            WHEN 'short_term' THEN 1
            WHEN 'medium_term' THEN 2
            WHEN 'long_term' THEN 3
            ELSE 4
          END
    """
    rows = await database.fetch_all(query, {"student_id": student_id})
    return {"data": rows}
# ------------------------------------------------------------------------------
# Startup & shutdown events
# ------------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# ------------------------------------------------------------------------------
# CRUD endpoints for Users
# ------------------------------------------------------------------------------
@app.get("/users", response_model=List[User])
async def list_users():
    return await database.fetch_all(users_table.select())

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int = Path(...)):
    row = await database.fetch_one(users_table.select().where(users_table.c.user_id == user_id))
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return row

@app.post("/users", response_model=User)
async def create_user(payload: User = Body(...)):
    values = payload.dict(exclude_unset=True)
    new_id = await database.execute(users_table.insert().values(**values))
    return await database.fetch_one(users_table.select().where(users_table.c.user_id == new_id))

@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int = Path(...), payload: User = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(users_table.update().where(users_table.c.user_id == user_id).values(**values))
    row = await database.fetch_one(users_table.select().where(users_table.c.user_id == user_id))
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return row

@app.delete("/users/{user_id}", response_model=dict)
async def delete_user(user_id: int = Path(...)):
    await database.execute(users_table.delete().where(users_table.c.user_id == user_id))
    return {"deleted": True}

# --- end of part 2/6 ---
# api.py (part 3/6: lines 401–600)

# ------------------------------------------------------------------------------
# CRUD Endpoints for Subjects
# ------------------------------------------------------------------------------
@app.get("/subjects", response_model=List[Subject])
async def list_subjects():
    return await database.fetch_all(subjects_table.select())

@app.get("/subjects/{subject_id}", response_model=Subject)
async def get_subject(subject_id: int = Path(...)):
    row = await database.fetch_one(
        subjects_table.select().where(subjects_table.c.subject_id == subject_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Subject not found")
    return row

@app.post("/subjects", response_model=Subject)
async def create_subject(payload: Subject = Body(...)):
    values = payload.dict(exclude_unset=True)
    new_id = await database.execute(subjects_table.insert().values(**values))
    return await database.fetch_one(
        subjects_table.select().where(subjects_table.c.subject_id == new_id)
    )

@app.put("/subjects/{subject_id}", response_model=Subject)
async def update_subject(subject_id: int = Path(...), payload: Subject = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        subjects_table.update()
        .where(subjects_table.c.subject_id == subject_id)
        .values(**values)
    )
    row = await database.fetch_one(
        subjects_table.select().where(subjects_table.c.subject_id == subject_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Subject not found")
    return row

@app.delete("/subjects/{subject_id}", response_model=dict)
async def delete_subject(subject_id: int = Path(...)):
    await database.execute(
        subjects_table.delete().where(subjects_table.c.subject_id == subject_id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Skills
# ------------------------------------------------------------------------------
@app.get("/skills", response_model=List[Skill])
async def list_skills():
    return await database.fetch_all(skills_table.select())

@app.get("/skills/{skill_id}", response_model=Skill)
async def get_skill(skill_id: int = Path(...)):
    row = await database.fetch_one(
        skills_table.select().where(skills_table.c.skill_id == skill_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Skill not found")
    return row

# @app.post("/skills", response_model=Skill)
# async def create_skill(payload: Skill = Body(...)):
#     values = payload.dict(exclude_unset=True)
#     new_id = await database.execute(skills_table.insert().values(**values))
#     return await database.fetch_one(
#         skills_table.select().where(skills_table.c.skill_id == new_id)
#     )

from fastapi import Body

class SkillIn(BaseModel):
    name: str
    description: str
    subject_id: int
    level: str

@app.post("/skills", response_model=Skill)
async def create_skill(skill: SkillIn):
    query = """
        INSERT INTO skills (name, description, subject_id, level)
        VALUES (:name, :description, :subject_id, :level)
    """
    await database.execute(query, values=skill.dict())

    fetch_query = """
        SELECT * FROM skills
        WHERE skill_id = (SELECT MAX(skill_id) FROM skills)
    """
    return await database.fetch_one(fetch_query)


# @app.put("/skills/{skill_id}", response_model=Skill)
# async def update_skill(skill_id: int = Path(...), payload: Skill = Body(...)):
#     values = payload.dict(exclude_unset=True)
#     await database.execute(
#         skills_table.update().where(skills_table.c.skill_id == skill_id).values(**values)
#     )
#     row = await database.fetch_one(
#         skills_table.select().where(skills_table.c.skill_id == skill_id)
#     )
#     if not row:
#         raise HTTPException(status_code=404, detail="Skill not found")
#     return row

@app.put("/skills/{skill_id}", response_model=Skill)
async def update_skill(skill_id: int, skill: SkillIn):
    query = """
        UPDATE skills SET name = :name, description = :description,
        subject_id = :subject_id, level = :level
        WHERE skill_id = :id
    """
    await database.execute(query, {**skill.dict(), "id": skill_id})
    return await database.fetch_one("SELECT * FROM skills WHERE skill_id = :id", {"id": skill_id})


@app.delete("/skills/{skill_id}", response_model=dict)
async def delete_skill(skill_id: int = Path(...)):
    await database.execute(
        skills_table.delete().where(skills_table.c.skill_id == skill_id)
    )
    return {"deleted": True}

# ------------------------------------------------------------------------------
# CRUD Endpoints for Schools
# ------------------------------------------------------------------------------
@app.get("/schools", response_model=List[School])
async def list_schools():
    return await database.fetch_all(schools_table.select())

@app.get("/schools/{school_id}", response_model=School)
async def get_school(school_id: int = Path(...)):
    row = await database.fetch_one(
        schools_table.select().where(schools_table.c.school_id == school_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="School not found")
    return row

# @app.post("/schools", response_model=School)
# async def create_school(payload: School = Body(...)):
#     values = payload.dict(exclude_unset=True)
#     new_id = await database.execute(schools_table.insert().values(**values))
#     return await database.fetch_one(
#         schools_table.select().where(schools_table.c.school_id == new_id)
#     )

@app.post("/schools", response_model=School)
async def create_school(payload: SchoolCreate = Body(...)):
    values = payload.dict(exclude_unset=True)
    new_id = await database.execute(schools_table.insert().values(**values))
    return await database.fetch_one(
        schools_table.select().where(schools_table.c.school_id == new_id)
    )


@app.patch("/schools/{school_id}/status")
def update_school_status(school_id: int, status_update: StatusUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE schools SET status = ? WHERE school_id = ?", (status_update.status, school_id))
    conn.commit()
    return {"message": "Status updated"}

@app.put("/schools/{school_id}", response_model=School)
async def update_school(school_id: int = Path(...), payload: School = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        schools_table.update().where(schools_table.c.school_id == school_id).values(**values)
    )
    row = await database.fetch_one(
        schools_table.select().where(schools_table.c.school_id == school_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="School not found")
    return row

@app.delete("/schools/{school_id}", response_model=dict)
async def delete_school(school_id: int = Path(...)):
    await database.execute(
        schools_table.delete().where(schools_table.c.school_id == school_id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Teachers
# ------------------------------------------------------------------------------
@app.get("/teachers", response_model=List[Teacher])
async def list_teachers():
    return await database.fetch_all(teachers_table.select())

@app.get("/teachers/{teacher_id}", response_model=Teacher)
async def get_teacher(teacher_id: str = Path(...)): #int
    row = await database.fetch_one(
        teachers_table.select().where(teachers_table.c.teacher_id == teacher_id) #teachers_table.c.teacher_id == teacher_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return row

@app.post("/teachers", response_model=Teacher)
async def create_teacher(teacher: TeacherCreate):
    # 1. Öğretmeni Teachers tablosuna ekle
    teacher_query = teachers_table.insert().values(
        teacher_id=teacher.teacher_id,
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        email=teacher.email, # This is where the value from Pydantic model is used
        status=teacher.status,
        school_id=teacher.school_id,
    )
    new_teacher_id = await database.execute(teacher_query)

    # 2. Öğretmeni Users tablosuna ekle
    # Varsayılan bir şifre ve rol atayalım (örneğin 'teacher')
    # Gerçek uygulamada şifre hashlenmeli ve daha güvenli bir şekilde yönetilmelidir.
    #user_query = users_table.insert().values(
    #    username=f"{teacher.first_name} {teacher.last_name}",
    #    email=teacher.email,
    #    password="password123",  # Varsayılan şifre, güvenli bir şekilde değiştirilmeli
    #    role="teacher",
    #    first_name=teacher.first_name,
    #    last_name=teacher.last_name,
    #    status="Active",
    #    school_id=teacher.school_id,
    #)
    #new_user_id = await database.execute(user_query)

    # 3. Teachers tablosundaki user_id alanını güncelle
    #await database.execute(
    #    teachers_table.update()
    #    .where(teachers_table.c.teacher_id == new_teacher_id)
    #    .values(user_id=new_user_id)
    #)

    # Oluşturulan öğretmeni döndür
    return await database.fetch_one(teachers_table.select().where(teachers_table.c.teacher_id == teacher.teacher_id)) #teachers_table.c.teacher_id == new_teacher_id

@app.put("/teachers/{teacher_id}", response_model=Teacher)
async def update_teacher(teacher_id: str = Path(...), payload: Teacher = Body(...)): #int
    values = payload.dict(exclude_unset=True)
    await database.execute(
        teachers_table.update().where(teachers_table.c.teacher_id == teacher_id).values(**values)
    )
    row = await database.fetch_one(
        teachers_table.select().where(teachers_table.c.teacher_id == teacher_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return row

@app.delete("/teachers/{teacher_id}", response_model=dict)
async def delete_teacher(teacher_id: str = Path(...)): #int
    await database.execute(
        teachers_table.delete().where(teachers_table.c.teacher_id == teacher_id)
    )
    return {"deleted": True}

@app.put("/teachers/{teacher_id}/status")
async def update_teacher_status(teacher_id: int, status_update: TeacherStatusUpdate):
    query = teachers_table.update().where(teachers_table.c.teacher_id == teacher_id).values(
        status=status_update.status
    )
    result = await database.execute(query)

    if not result:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return {"message": "Teacher status updated"}

@app.get("/classes", response_model=List[Class])
async def get_classes():
    # 1) fetch all class rows
    class_rows = await database.fetch_all(classes_table.select())

    results = []
    for c in class_rows:
        cid = c["class_id"]

        # 2) grab up to 5 students for this class
        students_q = (
            students_table
            .select()
            .where(students_table.c.class_id == cid)
            .limit(5)
        )
        student_rows = await database.fetch_all(students_q)
        student_list = [
            StudentListItem(
                id=s["student_internal_id"],
                name=s["name"],
                grade=s["grade"],
                avgScore=s["avg_score"] or 0.0,
            )
            for s in student_rows
        ]

        # 3) grab up to 3 recent games for this class
        games_q = (
            class_recent_games_table
            .select()
            .where(class_recent_games_table.c.class_id == cid)
            .order_by(desc(class_recent_games_table.c.game_date))
            .limit(3)
        )
        game_rows = await database.fetch_all(games_q)
        recent_games = [
            RecentGame(
                id=g["id"],
                name=g["game_name"],
                date=g["game_date"],       # Pydantic sees datetime and auto‑serializes
                avgScore=g["avg_score"] or 0.0,
            )
            for g in game_rows
        ]

        # 4) assemble into the final dict
        results.append(
            {
                **dict(c),             # all the original class fields
                "studentList": student_list,
                "recentGames": recent_games,
            }
        )

    return results

@app.get("/getclasses", response_model=List[Class])
async def get_classes(school_id: int = Query(...)):
    # 1) fetch class rows for this school
    class_rows = await database.fetch_all(
        classes_table.select().where(classes_table.c.school_id == school_id)
    )

    results = []
    for c in class_rows:
        cid = c["class_id"]

        # 2) grab up to 5 students for this class
        students_q = (
            students_table
            .select()
            .where(students_table.c.class_id == cid)
            .limit(5)
        )
        student_rows = await database.fetch_all(students_q)
        student_list = [
            StudentListItem(
                id=s["student_internal_id"],
                name=s["name"],
                grade=s["grade"],
                avgScore=s["avg_score"] or 0.0,
            )
            for s in student_rows
        ]

        # 3) grab up to 3 recent games for this class
        games_q = (
            class_recent_games_table
            .select()
            .where(class_recent_games_table.c.class_id == cid)
            .order_by(desc(class_recent_games_table.c.game_date))
            .limit(3)
        )
        game_rows = await database.fetch_all(games_q)
        recent_games = [
            RecentGame(
                id=g["id"],
                name=g["game_name"],
                date=g["game_date"],
                avgScore=g["avg_score"] or 0.0,
            )
            for g in game_rows
        ]

        # 4) assemble into the final dict
        results.append(
            {
                **dict(c),
                "studentList": student_list,
                "recentGames": recent_games,
            }
        )

    return results

@app.get("/classes/{class_id}", response_model=Class)
async def get_class(class_id: int = Path(..., ge=1)):
    c = await database.fetch_one(
        classes_table.select().where(classes_table.c.class_id == class_id)
    )
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")

    student_rows = await database.fetch_all(
        students_table.select().where(students_table.c.class_id == class_id).limit(50)
    )
    student_list = [
        StudentListItem(
            id=s["student_internal_id"],
            name=s["name"],
            grade=s["grade"],                    # ← use s["grade"]
            avgScore=s["avg_score"] or 0.0,      # ← use s["avg_score"]
        )
        for s in student_rows
    ]

    game_rows = await database.fetch_all(
        class_recent_games_table.select()
        .where(class_recent_games_table.c.class_id == class_id)
        .order_by(desc(class_recent_games_table.c.game_date))
        .limit(3)
    )
    recent_games = [
        RecentGame(
            id=g["id"],
            name=g["game_name"],
            date=g["game_date"],
            avgScore=g["avg_score"] or 0.0,
        )
        for g in game_rows
    ]

    return {
        **dict(c),
        "studentList": student_list,
        "recentGames": recent_games
    }

# ------------------------------------------------------------------------------
# CREATE new class
# ------------------------------------------------------------------------------
# @app.post("/classes", response_model=Class, status_code=201)
# async def create_class(payload: Class = Body(...)):
#     values = payload.dict(exclude={"class_id", "studentList", "recentGames"}, exclude_unset=True)
#     new_id = await database.execute(classes_table.insert().values(**values))
#     return await get_class(new_id)

@app.post("/classes", response_model=Class)
async def create_class(class_: ClassCreate):
    query = classes_table.insert().values(
        class_name=class_.class_name,
        grade_level=class_.grade_level,
        description=class_.description,
        schedule=class_.schedule,
        location=class_.location,
        status=class_.status,
        teacher_id=class_.teacher_id,
        school_id=class_.school_id,
    )
    new_id = await database.execute(query)
    return await database.fetch_one(classes_table.select().where(classes_table.c.class_id == new_id))


class Class(ClassCreate):
    class_id: int


# ------------------------------------------------------------------------------
# UPDATE existing class
# ------------------------------------------------------------------------------
@app.put("/classes/{class_id}", response_model=Class)
async def update_class(
    class_id: int = Path(..., ge=1),
    payload: Class = Body(...)
):
    values = payload.dict(exclude={"class_id", "studentList", "recentGames"}, exclude_unset=True)
    await database.execute(
        classes_table.update()
        .where(classes_table.c.class_id == class_id)
        .values(**values)
    )
    return await get_class(class_id)

# ------------------------------------------------------------------------------
# DELETE a class
# ------------------------------------------------------------------------------
@app.delete("/classes/{class_id}", response_model=dict)
async def delete_class(class_id: int = Path(..., ge=1)):
    # optionally cascade delete ClassRecentGames, etc.
    await database.execute(
        classes_table.delete().where(classes_table.c.class_id == class_id)
    )
    return {"deleted": True}

@app.get("/classes", response_model=List[Class])
async def get_classes(school_id: Optional[int] = Query(None)):
    if school_id is not None:
        query = classes_table.select().where(classes_table.c.school_id == school_id)
    else:
        query = classes_table.select()
    return await database.fetch_all(query)


# ------------------------------------------------------------------------------
# CRUD Endpoints for ClassRecentGames
# ------------------------------------------------------------------------------
@app.get("/classes/{class_id}/recent-games", response_model=List[RecentGame])
async def list_class_recent_games(class_id: int = Path(...)):
    return await database.fetch_all(
        class_recent_games_table.select().where(class_recent_games_table.c.class_id == class_id)
    )

@app.get("/recent-games/{id}", response_model=RecentGame)
async def get_class_recent_game(id: int = Path(...)):
    row = await database.fetch_one(
        class_recent_games_table.select().where(class_recent_games_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Recent game not found")
    return row

@app.post("/classes/{class_id}/recent-games", response_model=RecentGame)
async def create_class_recent_game(class_id: int = Path(...), payload: RecentGame = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["class_id"] = class_id
    new_id = await database.execute(class_recent_games_table.insert().values(**values))
    return await database.fetch_one(
        class_recent_games_table.select().where(class_recent_games_table.c.id == new_id)
    )

@app.put("/recent-games/{id}", response_model=RecentGame)
async def update_class_recent_game(id: int = Path(...), payload: RecentGame = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        class_recent_games_table.update().where(class_recent_games_table.c.id == id).values(**values)
    )
    row = await database.fetch_one(
        class_recent_games_table.select().where(class_recent_games_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Recent game not found")
    return row

@app.delete("/recent-games/{id}", response_model=dict)
async def delete_class_recent_game(id: int = Path(...)):
    await database.execute(
        class_recent_games_table.delete().where(class_recent_games_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Students
# ------------------------------------------------------------------------------

def normalize_student(row):
    return {
        **row,
        "email": str(row.get("email") or ""),
        "phone": str(row.get("phone") or ""),
        "address": str(row.get("address") or ""),
        "teacher": str(row.get("teacher") or ""),
        "status": str(row.get("status") or ""),
        "notes": str(row.get("notes") or ""),
        "parent_name": str(row.get("parent_name") or ""),
        "parent_email": str(row.get("parent_email") or ""),
        "parent_phone": str(row.get("parent_phone") or ""),
    }


@app.get("/students", response_model=List[Student])
async def get_students(school_id: int = Query(...)):
    query = students_table.select().where(students_table.c.school_id == school_id)
    rows = await database.fetch_all(query)
    return [normalize_student(dict(r)) for r in rows]

# @app.get("/students", response_model=List[Student])
# async def get_students(school_id: int = Query(...)):
#     query = """
#     SELECT
#         student_internal_id as student_internal_id,
#         student_external_id,
#         name,
#         email,
#         grade,
#         avatar,
#         status,
#         join_date,
#         avg_score,
#         avg_time_per_session,
#         last_active,
#         phone,
#         progress_status,
#         class_id,
#         games_played,
#         user_id,
#         school_id
#         parent_email,
#         parent_name,
#         parent_phone,
#         notes,
#         address
#     FROM students
#     WHERE school_id = :school_id
#     """
#     rows = await database.fetch_all(query, values={"school_id": school_id})
#     return rows


@app.get("/students/{student_internal_id}", response_model=Student)
async def get_student(student_internal_id: str = Path(...)): #int
    logger.info("Öğrenci sorgulanıyor...")

    row = await database.fetch_one(
        students_table.select().where(students_table.c.student_internal_id == student_internal_id) #students_table.c.student_internal_id == student_internal_id
    )

    if not row:
        logger.warning(f"Student with ID {student_internal_id} not found.")
        raise HTTPException(status_code=404, detail="Student not found")

    student_data = dict(row)
    logger.info(f"Öğrenci bulundu: {student_data}")

    return Student(**student_data)

# @app.post("/students", response_model=Student)
# async def create_student(payload: Student = Body(...)):
#     values = payload.dict(exclude_unset=True)
#     new_id = await database.execute(students_table.insert().values(**values))
#     return await database.fetch_one(
#         students_table.select().where(students_table.c.student_internal_id == new_id)
#     )

@app.post("/students", response_model=Student)
async def create_student(payload: StudentCreate = Body(...), school_id: int = Query(...)):
    values = payload.dict()
    #values["school_id"] = school_id

    new_id = await database.execute(students_table.insert().values(
        student_internal_id=values["student_internal_id"],
        class_id=values["class_id"],
        school_id=values["school_id"],
        status=values.get("status", "Active")
    ))
    return await database.fetch_one(
        students_table.select().where(students_table.c.student_internal_id == payload.student_internal_id) #students_table.c.student_internal_id == new_id
    )


@app.put("/students/{student_internal_id}", response_model=Student)
async def update_student(
    student_internal_id: str = Path(...), #int
    payload: Student = Body(...)
):
    values = payload.dict(exclude_unset=True)
    print(values)

    # Eksik school_id kontrolü
    if "school_id" not in values or values["school_id"] is None:
        raise HTTPException(status_code=400, detail="school_id is required")

    # 1) Öğrenci var mı kontrol et
    existing_student = await database.fetch_one(
        students_table.select().where(students_table.c.student_internal_id == student_internal_id) #students_table.c.student_internal_id == student_internal_id
    )

    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2) Öğrenciyi güncelle
    await database.execute(
        students_table.update()
        .where(students_table.c.student_internal_id == student_internal_id) #students_table.c.student_internal_id == student_internal_id
        .values(**values)
    )

    # 3) Güncellenen veriyi getir
    updated_student = await database.fetch_one(
        students_table.select().where(students_table.c.student_internal_id == student_internal_id) #students_table.c.student_internal_id == student_internal_id
    )

    return updated_student


@app.delete("/students/{student_internal_id}", response_model=dict)
async def delete_student(student_internal_id: str = Path(...)): #int
    await database.execute(
        students_table.delete().where(students_table.c.student_internal_id == student_internal_id) #students_table.c.student_internal_id == student_internal_id
    )
    return {"deleted": True}
# ------------------------------------------------------------------------------
# CRUD Endpoints for Strengths
# ------------------------------------------------------------------------------
#@app.get("/strengths", response_model=List[Strength])
#async def list_strengths():
#    return await database.fetch_all(strengths_table.select())
@app.get("/strengths")
def get_possible_strengths():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT strength_id, name, description, category FROM strengths")
    rows = cursor.fetchall()
    return [
        {"id": row[0], "name": row[1], "description": row[2], "category":row[3] or ""}
        for row in rows
    ]

@app.get("/strengths/{strength_id}")
def get_strength(strength_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT strength_id, name, description FROM strengths WHERE strength_id = ?", (strength_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Strength not found")
    return {"strength_id": row[0], "name": row[1], "description": row[2]}
@app.post("/strengths")
def create_strength(data: dict = Body(...)):
    name = data.get("name")
    description = data.get("description")
    category = data.get("category")

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO strengths (name, description,category) VALUES (?, ?, ?)",
        (name, description, category)
    )
    conn.commit()
    return {"message": "Strength created"}

@app.put("/strengths/{strength_id}")
def update_strength(strength_id: int, data: dict = Body(...)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE strengths SET name = ?, description = ?, category = ?  WHERE strength_id = ?",
        (data.get("name"), data.get("description"), data.get("category"), strength_id)
    )
    conn.commit()
    return {"message": "Strength updated"}

@app.delete("/strengths/{strength_id}")
def delete_strength(strength_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM strengths WHERE strength_id = ?", (strength_id,))
    conn.commit()
    return {"message": "Strength deleted"}

# ------------------------------------------------------------------------------
# CRUD Endpoints for Development Areas
# ------------------------------------------------------------------------------
@app.get("/development-areas", response_model=List[DevelopmentArea])
async def list_development_areas():
    return await database.fetch_all(development_areas_table.select())

@app.get("/development-areas/{area_id}", response_model=DevelopmentArea)
async def get_development_area(area_id: int = Path(...)):
    row = await database.fetch_one(
        development_areas_table.select().where(development_areas_table.c.area_id == area_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Development area not found")
    return row

@app.post("/development-areas", response_model=DevelopmentArea)
async def create_development_area(payload: DevelopmentArea = Body(...)):
    values = payload.dict(exclude_unset=True)
    new_id = await database.execute(development_areas_table.insert().values(**values))
    return await database.fetch_one(
        development_areas_table.select().where(development_areas_table.c.area_id == new_id)
    )

@app.put("/development-areas/{area_id}", response_model=DevelopmentArea)
async def update_development_area(area_id: int = Path(...), payload: DevelopmentArea = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        development_areas_table.update()
        .where(development_areas_table.c.area_id == area_id)
        .values(**values)
    )
    row = await database.fetch_one(
        development_areas_table.select().where(development_areas_table.c.area_id == area_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Development area not found")
    return row

@app.delete("/development-areas/{area_id}", response_model=dict)
async def delete_development_area(area_id: int = Path(...)):
    await database.execute(
        development_areas_table.delete().where(development_areas_table.c.area_id == area_id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Student Strengths
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/strengths", response_model=List[StudentStrength])
async def list_student_strengths(student_id: int = Path(...)):
    return await database.fetch_all(
        student_strengths_table.select().where(student_strengths_table.c.student_id == student_id)
    )

@app.post("/students/{student_id}/strengths", response_model=StudentStrength)
async def add_student_strength(student_id: int = Path(...), payload: StudentStrength = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(student_strengths_table.insert().values(**values))
    return await database.fetch_one(
        student_strengths_table.select().where(student_strengths_table.c.id == new_id)
    )

@app.delete("/students/{student_id}/strengths/{id}", response_model=dict)
async def remove_student_strength(student_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        student_strengths_table.delete().where(student_strengths_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Student Development Areas
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/development-areas", response_model=List[StudentDevelopmentArea])
async def list_student_development_areas(student_id: int = Path(...)):
    return await database.fetch_all(
        student_development_areas_table.select().where(student_development_areas_table.c.student_id == student_id)
    )

@app.post("/students/{student_id}/development-areas", response_model=StudentDevelopmentArea)
async def add_student_development_area(student_id: int = Path(...), payload: StudentDevelopmentArea = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(student_development_areas_table.insert().values(**values))
    return await database.fetch_one(
        student_development_areas_table.select().where(student_development_areas_table.c.id == new_id)
    )

@app.put("/students/{student_id}/development-areas/{id}", response_model=StudentDevelopmentArea)
async def update_student_development_area(student_id: int = Path(...), id: int = Path(...), payload: StudentDevelopmentArea = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        student_development_areas_table.update()
        .where(student_development_areas_table.c.id == id)
        .values(**values)
    )
    row = await database.fetch_one(
        student_development_areas_table.select().where(student_development_areas_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Student development area not found")
    return row

@app.delete("/students/{student_id}/development-areas/{id}", response_model=dict)
async def remove_student_development_area(student_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        student_development_areas_table.delete().where(student_development_areas_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Games
# ------------------------------------------------------------------------------
@app.get("/games", response_model=List[Game])
async def list_games():
    return await database.fetch_all(games_table.select())

@app.get("/gamesco/{game_id}", response_model=Game)
async def get_game(game_id: int = Path(...)):
    row = await database.fetch_one(
        games_table.select().where(games_table.c.game_id == game_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Game not found")
    return row

#@app.get("/games/{game_id}", response_model=Game)
#async def get_game(game_id: int = Path(...)):
#    row = await database.fetch_one(
#        games_table.select().where(games_table.c.game_id == game_id)
#    )
#    if not row:
#        raise HTTPException(status_code=404, detail="Game not found")
#    return row
######### bu games sonradan commentledim.
# @app.get("/games/{game_id}", response_model=Game)
# async def get_game_by_id(game_id: int):
#     game = query_db("SELECT * FROM Games WHERE game_id = ?", [game_id], one=True)
#     if not game:
#         raise HTTPException(status_code=404, detail="Game not found")
#     return Game(**game)


class GameStartStatus(BaseModel):
    start: int

@app.get("/checkgames/{game_id}/start", response_model=GameStartStatus)
async def get_checkgame_by_id(game_id: int):
    if game_id == 1:
        return {"start": 1}
    else:
        return {"start": 0}

###################3  WEBSOCKET  ####################################
game_sessions = []
session_counter = 1

class GameSession(BaseModel):
    session_id: int
    game_id: int
    student_id: int
    is_active: bool = False
    result_score: Optional[int] = None
    is_started: bool = False
    user_id: int

# class GameSession:
#     def __init__(self, session_id, game_id, student_id):
#         self.session_id = session_id
#         self.game_id = game_id
#         self.student_id = student_id
#         self.is_active = False
#         self.result_score = None
#         self.is_started = False  # 🔴 Bu önemli

class GameStartRequest(BaseModel):
    game_id: int
    student_ids: List[int]

class StartSignalPayload(BaseModel):
    game_id: str
    student_id: str
    user_id: Optional[int] = None

# @app.post("/gamesession/start")
# def start_game_session(data: GameStartRequest):
#     global session_counter
#     existing_sessions = {s.student_id for s in game_sessions if s.game_id == data.game_id}
#
#     for sid in data.student_ids:
#         if sid in existing_sessions:
#             continue  # aynı öğrenci için aynı oyun tekrar eklenmesin
#
#         game_sessions.append(GameSession(
#             session_id=session_counter,
#             game_id=data.game_id,
#             student_id=sid
#         ))
#         session_counter += 1
#
#     return {"status": "queued", "total": len(data.student_ids)}

# @app.post("/gamesession/start")
# async def start_game_session(request: Request):
#     data = await request.json()
#     student_internal_id = data.get("student_internal_id")
#     game_id = data.get("game_id")
#     session_id = data.get("session_id")  # Unity'den gelen varsa
#
#     if not student_internal_id or not game_id:
#         return {"error": "student_internal_id and game_id required"}
#
#     await database.execute(
#         """
#         INSERT INTO game_sessions (student_internal_id, game_id, session_id, completed)
#         VALUES (:student_id, :game_id, :session_id, 0)
#         """,
#         {"student_internal_id": student_internal_id, "game_id": game_id, "session_id": session_id}
#     )
#     return {"status": "started"}


@app.post("/gamesession/start")
async def start_game_session(request: Request):
    data = await request.json()
    student_id = data.get("student_id")
    game_id = data.get("game_id")
    user_id = data.get("user_id")

    logger.info(f"Game session başlatılıyor -> student_id={student_id}, game_id={game_id} by {user_id}")


    if not student_id or not game_id:
        raise HTTPException(status_code=400, detail="student_id ve game_id zorunludur")

    existing = await database.fetch_one(
        """
        SELECT session_id, student_id, game_id 
        FROM game_sessions 
        WHERE student_id = :sid AND game_id = :gid AND completed = 0 AND user_id = :uid
        """,
        {"sid": student_id, "gid": game_id, "uid": user_id},
    )
    if existing:
        logger.info(f"Zaten mevcut session var: student_id={student_id}, game_id={game_id}, session={existing!r}")

        return existing

    new_id = await database.execute(
        """
        INSERT INTO game_sessions (student_id, game_id, completed, is_started, created_at, user_id)
        VALUES (:sid, :gid, 0, 0, CURRENT_TIMESTAMP, :uid)
        """,
        {"sid": student_id, "gid": game_id, "uid": user_id},
    )

    logger.info(f"Yeni session oluşturuldu: session_id={new_id} by {user_id}")

    return await database.fetch_one(
        "SELECT session_id, student_id, game_id FROM game_sessions WHERE session_id = :id",
        {"id": new_id}
    )

@app.get("/games/{game_id}")
async def get_game(game_id: int):
    query = games_table.select().where(games_table.c.game_id == game_id)
    row = await database.fetch_one(query)
    if not row:
        raise HTTPException(status_code=404, detail="Game not found")
    return row

# @app.get("/gamesession/ui-sync-status")
# async def get_ui_sync_status():
#     row = await database.fetch_one(
#         "SELECT * FROM RecentPlayers ORDER BY id DESC LIMIT 1"
#     )
#     if not row:
#         return {}
#
#     return {
#         "student_id": row["student_id"],
#         "session_id": row["id"],
#         "completed": True,
#         "score": row["score"],
#     }


# @app.post("/gamesession/{session_id}/start")
# def mark_game_session_started(session_id: int):
#     for session in game_sessions:
#         if session.session_id == session_id:
#             session.is_started = True
#             return {"status": "started"}
#     raise HTTPException(status_code=404, detail="Session not found")

@app.post("/gamesession/{session_id}/start")
async def start_game_session(session_id: int):
    session = await database.fetch_one(
        "SELECT * FROM game_sessions WHERE session_id = :sid", {"sid": session_id}
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["is_started"] == 1:
        return {"message": "Session already started", "session_id": session_id}

    await database.execute(
        "UPDATE game_sessions SET is_started = 1, updated_at = :now WHERE session_id = :sid",
        {"sid": session_id, "now": datetime.utcnow()}
    )

    return {"message": "Game session started", "session_id": session_id}

# @app.get("/games/{game_id}/students")
# async def get_students_for_game(game_id: int):
#     # Örnek içerik
#     students = await database.fetch_all(
#         "SELECT s.id, s.name FROM students s JOIN game_sessions g ON s.id = g.student_id WHERE g.game_id = :game_id",
#         {"game_id": game_id}
#     )
#     return students

# @app.get("/games/{game_id}/students")
# async def get_students_for_game(game_id: int):
#     query = """
#     SELECT s.student_internal_id AS id, s.name, s.grade, s.avg_score
#     FROM students s
#     JOIN game_sessions gs ON s.student_internal_id = gs.student_id
#     WHERE gs.game_id = :gid
#     ORDER BY gs.session_id ASC
#     """
#     rows = await database.fetch_all(query, {"gid": game_id})
#
#     if not rows:
#         raise HTTPException(status_code=404, detail="Game not found or no students assigned")
#
#     return [dict(r) for r in rows]

# @app.get("/games/{game_id}/play")
# async def get_game_play_data(game_id: int, students: str = Query(...), school_id: int = Query(...)):
#     student_ids = [int(sid) for sid in students.split(",")]
#
#     # Örnek olarak sadece öğrenci bilgilerini çekiyoruz
#     query = """
#     SELECT student_internal_id AS id, name, grade, avg_score
#     FROM students
#     WHERE student_internal_id IN :ids AND school_id = :school
#     """
#     rows = await database.fetch_all(query, {"ids": tuple(student_ids), "school": school_id})
#
#     if not rows:
#         raise HTTPException(status_code=404, detail="Students not found")
#
#     return {
#         "game_id": game_id,
#         "school_id": school_id,
#         "students": [dict(row) for row in rows]
#     }
######################################################################################
class UISyncData(BaseModel):
    student_id: int
    session_id: int
    completed: bool
    score: int

# @app.get("/games/{game_id}/students")
# async def get_students_for_game(game_id: int):
#     query = """
#         SELECT DISTINCT s.student_internal_id, s.name, s.grade, s.avg_score
#         FROM students s
#         JOIN studentgameperformances h ON s.student_internal_id = h.student_id
#         WHERE h.game_id = :gid
#     """
#     rows = await database.fetch_all(query, {"gid": game_id})
#     return [dict(row) for row in rows]

@app.get("/games/{game_id}/students")
async def get_game_students(game_id: int):
    query = """
        SELECT s.student_internal_id AS id, s.name, s.grade, s.avg_score
        FROM students s
        WHERE s.student_internal_id IN (
            SELECT DISTINCT student_id
            FROM game_sessions
            WHERE game_id = :gid
        )
        ORDER BY s.student_internal_id ASC
    """
    rows = await database.fetch_all(query=query, values={"gid": game_id})
    return rows


@app.post("/gamesession")
async def register_game_session(payload: dict = Body(...)):
    student_id = payload.get("student_id")
    game_id = payload.get("game_id")

    existing = await database.fetch_one(
        """
        SELECT * FROM game_sessions 
        WHERE student_id = :sid AND game_id = :gid AND completed = 0 AND is_started = 0
        ORDER BY created_at DESC
        """,
        {"sid": student_id, "gid": game_id}
    )

    if existing:
        return {
            "session_id": existing["session_id"],
            "student_id": student_id,
            "game_id": game_id,
            "is_active": True
        }

    new_id = await database.execute(
        """
        INSERT INTO game_sessions (student_id, game_id, completed, is_started, created_at) 
        VALUES (:sid, :gid, 0, 0, :now)
        """,
        {"sid": student_id, "gid": game_id, "now": datetime.utcnow()}
    )

    return {
        "session_id": new_id,
        "student_id": student_id,
        "game_id": game_id,
        "is_active": True
    }


# @app.post("/gamesession/ui-sync")
# async def ui_sync(data: UISyncData):
#     # Validate required fields
#     if data.student_id is None:
#         raise HTTPException(status_code=422, detail="student_id is required")
#
#     # Update the database
#     await database.execute(
#         """
#         UPDATE game_sessions
#         SET score = :score, completed = :completed, updated_at = CURRENT_TIMESTAMP
#         WHERE session_id = :session_id AND student_id = :student_id
#         """,
#         {
#             "score": data.score,
#             "completed": data.completed,
#             "session_id": data.session_id,
#             "student_id": data.student_id,
#         }
#     )
#
#     # Log the update for debugging
#     print(
#         f"UI Sync: student_id={data.student_id}, session_id={data.session_id}, completed={data.completed}, score={data.score}")
#
#     return {"status": "updated"}

@app.post("/gamesession/ui-sync")
async def ui_sync(data: UISyncData):
    # Validate required fields
    if data.student_id is None:
        raise HTTPException(status_code=422, detail="student_id is required")

    # Gelen verileri normalize et
    student_id = int(data.student_id)
    session_id = int(data.session_id) if data.session_id is not None else None
    completed = bool(data.completed)
    score = int(data.score) if data.score is not None else None

    # Önce bu session için daha önce kayıt var mı kontrol et
    existing_record = await database.fetch_one(
        """
        SELECT score FROM game_sessions
        WHERE session_id = :session_id AND student_id = :student_id AND completed = 1
        """,
        {"session_id": session_id, "student_id": student_id}
    )

    # Eğer zaten tamamlanmış bir kayıt varsa, tekrar işlem yapma
    if existing_record:
        return {
            "status": "already_completed",
            "student_id": student_id,
            "session_id": session_id,
            "completed": completed,
            "score": existing_record["score"]
        }

    # Update the database
    await database.execute(
        """
        UPDATE game_sessions
        SET score = :score, completed = :completed, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = :session_id AND student_id = :student_id
        """,
        {
            "score": score,
            "completed": 1 if completed else 0,  # SQLite için 1/0 olarak kaydet
            "session_id": session_id,
            "student_id": student_id,
        }
    )

    # Log the update for debugging
    print(
        f"UI Sync: student_id={student_id}, session_id={session_id}, completed={completed}, score={score}")

    # Standartlaştırılmış yanıt döndür
    return {
        "status": "updated",
        "student_id": student_id,
        "session_id": session_id,
        "completed": completed,
        "score": score
    }

@app.get("/games/{game_id}/play")
async def get_game_play_data(
    game_id: int,
    students: str = Query(...),
    school_id: int = Query(...)
):
    student_ids = [int(sid) for sid in students.split(",")]
    placeholders = ",".join(["?"] * len(student_ids))
    query = f"""
    SELECT student_internal_id AS id, name, grade, avg_score
    FROM students
    WHERE student_internal_id IN ({placeholders}) AND school_id = ?
    """
    values = student_ids + [school_id]
    rows = await database.fetch_all(query=query, values=values)
    if not rows:
        raise HTTPException(status_code=404, detail="Students not found")
    return {
        "game_id": game_id,
        "school_id": school_id,
        "students": [dict(row) for row in rows]
    }
##################### send start signal eski
# @app.post("/gamesession/send-start-signal")
# async def send_start_signal(data: dict = Body(...)):
#     student_id = data.get("student_id")
#     game_id = data.get("game_id")
#
#     if not student_id or not game_id:
#         raise HTTPException(status_code=400, detail="Missing student_id or game_id")
#
#     await database.execute(
#         """
#         INSERT INTO GameSyncSignal (student_id, game_id, status)
#         VALUES (:sid, :gid, 'pending')
#         """,
#         {"sid": student_id, "gid": game_id}
#     )
#     return {"status": "pending", "student_id": student_id, "game_id": game_id}
ui_sync_status = {}

class StartSignal(BaseModel):
    student_id: int
    game_id: int
    user_id: Optional[int] = None

class UiSync(BaseModel):
    student_id: int
    session_id: Optional[int]
    completed: bool
    score: int


# @app.post("/gamesession/send-start-signal")
# async def send_start_signal(payload: StartSignal):
#     if not payload.student_id or not payload.game_id:
#         return JSONResponse(status_code=400, content={"detail": "Missing student_id or game_id"})
#     print(f"Start signal received for student {payload.student_id} and game {payload.game_id}")
#     return {"status": "started"}
# @app.post("/gamesession/send-start-signal")
# async def send_start_signal(payload: dict = Body(...)):
#     student_id = payload.get("student_id")
#     game_id = payload.get("game_id")
#
#     session = await database.fetch_one(
#         """
#         SELECT session_id FROM game_sessions
#         WHERE student_id = :sid AND game_id = :gid AND completed = 0 AND is_started = 0
#         ORDER BY created_at DESC LIMIT 1
#         """,
#         {"sid": student_id, "gid": game_id}
#     )
#
#     if not session:
#         raise HTTPException(status_code=404, detail="No session to start")
#
#     await database.execute(
#         """
#         UPDATE game_sessions
#         SET is_started = 1, updated_at = :now
#         WHERE session_id = :sid
#         """,
#         {"sid": session["session_id"], "now": datetime.utcnow()}
#     )
#
#     return {"message": "Game session started", "session_id": session["session_id"]}
@app.post("/gamesession/send-start-signal")
async def send_start_signal(payload: Dict[str, Any]):
    """
    Oyun başlatma sinyali gönderen endpoint.
    Bu endpoint, Unity'ye oyunu başlatması için sinyal gönderir.
    """
    try:
        game_id = payload.get("game_id")
        student_id = payload.get("student_id")
        user_id = payload.get("user_id")

        if not game_id or not student_id:
            raise HTTPException(status_code=400, detail="game_id and student_id are required")
        if user_id is None:
            logger.warning(f"No user_id provided for game {game_id}, student {student_id}")
            user_id = 0  # Default value if not provided

        logger.info(f"Sending start signal for game {game_id}, student {student_id} by {user_id}")

        # Önce bu öğrenci için tamamlanmış bir oturum olup olmadığını kontrol et
        existing_completed_session = await database.fetch_one(
            """
            SELECT session_id FROM game_sessions 
            WHERE student_id = :sid AND game_id = :gid AND completed = 1 AND user_id = :uid
            ORDER BY updated_at DESC LIMIT 1
            """,
            {"sid": student_id, "gid": game_id, "uid": user_id}
        )

        if existing_completed_session:
            # Bu öğrenci için zaten tamamlanmış bir oturum var, yeni oturum oluşturma
            session_id = existing_completed_session["session_id"]
            logger.warning(
                f"Student {student_id} already has a completed session {session_id} for game {game_id}. Not creating a new session.")
            return {"message": "Session already completed", "session_id": session_id}

        # Bu öğrenci için tamamlanmamış bir oturum olup olmadığını kontrol et
        existing_session = await database.fetch_one(
            """
            SELECT session_id FROM game_sessions 
            WHERE student_id = :sid AND game_id = :gid AND completed = 0 AND user_id = :uid
            ORDER BY created_at DESC LIMIT 1
            """,
            {"sid": student_id, "gid": game_id, "uid": user_id}
        )

        if existing_session:
            # Bu öğrenci için zaten tamamlanmamış bir oturum var, bunu kullan
            session_id = existing_session["session_id"]
            logger.info(
                f"Student {student_id} already has an incomplete session {session_id} for game {game_id}. Using this session.")

            # Oturumu başlatılmış olarak işaretle
            await database.execute(
                """
                UPDATE game_sessions 
                SET is_started = 1, updated_at = :now 
                WHERE session_id = :sid
                """,
                {"sid": session_id, "now": datetime.utcnow()}
            )
        else:
            # Yeni bir oturum oluştur
            session_id = await database.execute(
                """
                INSERT INTO game_sessions (student_id, game_id, completed, is_started, created_at, updated_at, user_id)
                VALUES (:student_id, :game_id, 0, 1, :now, :now, :user_id)
                """,
                {"student_id": student_id, "game_id": game_id, "now": datetime.utcnow(), "user_id": user_id}
            )
            logger.info(f"Created new session {session_id} for student {student_id}, game {game_id} by {user_id}")

        # Unity'ye başlatma sinyali gönder
        # Bu kısım, Unity'nin nasıl sinyal aldığına bağlı olarak değişebilir

        return {"message": "Start signal sent", "session_id": session_id, "game_id": game_id}
    except Exception as e:
        logger.error(f"Error sending start signal: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/gamesession/all-scores")
async def get_all_scores(game_id: int, student_ids: str):
    """
    Belirli bir oyun ve öğrenci listesi için tüm skorları döndüren endpoint.
    """
    try:
        # student_ids string'ini liste haline getir
        student_id_list = [int(sid) for sid in student_ids.split(",")]

        # Her öğrenci için ayrı ayrı sorgu yap
        student_scores = {}

        for student_id in student_id_list:
            # Bu öğrenci için en son kaydı al
            query = """
            SELECT student_id, score, completed
            FROM game_sessions
            WHERE game_id = :game_id AND student_id = :student_id
            ORDER BY updated_at DESC
            LIMIT 1
            """

            result = await database.fetch_one(
                query,
                {"game_id": game_id, "student_id": student_id}
            )

            if result:
                student_scores[student_id] = {
                    "score": result["score"],
                    "completed": result["completed"] == 1
                }

        return student_scores
    except Exception as e:
        logger.error(f"Error getting all scores: {str(e)}")
        # Hata detaylarını yazdır
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/gamesession/pending-sync")
async def get_pending_sync():
    row = await database.fetch_one(
        """
        SELECT id, student_id, game_id FROM GameSyncSignal
        WHERE status = 'pending'
        ORDER BY created_at ASC LIMIT 1
        """
    )
    if not row:
        return {}

    await database.execute(
        "UPDATE GameSyncSignal SET status = 'sent' WHERE id = :id",
        {"id": row["id"]}
    )

    return dict(row)
# @app.get("/gamesession/{session_id}/status")
# def get_session_status(session_id: int):
#     for session in game_sessions:
#         if session.session_id == session_id:
#             return {"is_started": session.is_started}
#     raise HTTPException(status_code=404, detail="Session not found")

@app.get("/gamesession/{session_id}/status")
async def get_session_status(session_id: int):
    session = await database.fetch_one(
        "SELECT is_started FROM game_sessions WHERE session_id = :sid",
        {"sid": session_id}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"is_started": session["is_started"]}


# @app.get("/gamesession/next", response_model=Optional[GameSession])
# def get_next_session():
#     for session in game_sessions:
#         print("DEBUG >>", session.session_id, session.student_id, session.is_active, session.result_score, session.is_started, session.game_id)
#         if not session.is_started and session.result_score is None:
#             session.is_active = True  # aktif işaretleniyor
#             return session
#     print("DEBUG >> no next session found")
#     return None

# @app.get("/gamesession/next", response_model=Optional[GameSession])
# def get_next_session(game_id: int = Query(...)):
#     for session in game_sessions:
#         print("DEBUG >>", session.session_id, session.student_id, session.is_active, session.result_score, session.is_started, session.game_id)
#         if session.game_id == game_id and not session.is_started and session.result_score is None:
#             session.is_active = True
#             return session
#     print("DEBUG >> no next session found")
#     return None
from typing import Optional

@app.get("/gamesession/next", response_model=Optional[dict])
async def get_next_session(game_id: int = Query(...)):
    row = await database.fetch_one(
        """
        SELECT session_id, student_id, game_id 
        FROM game_sessions 
        WHERE game_id = :gid AND completed = 0 
        ORDER BY created_at ASC LIMIT 1
        """,
        {"gid": game_id}
    )
    if not row:
        print("DEBUG >> no next session found")
        return None

    print("DEBUG >> next session found:", row)
    return dict(row)


@app.get("/gamesession/all")
def list_all_sessions():
    return [s.dict() for s in game_sessions]

current_ui_sync = {"student_id": None, "session_id": None}


# @app.post("/gamesession/ui-sync")
# async def ui_sync(request: Request):
#     form = await request.form()
#
#     student_id = form.get("student_id")
#     session_id = form.get("session_id")
#     completed = form.get("completed")
#     score = form.get("score")
#
#     if student_id is None or session_id is None:
#         raise HTTPException(status_code=400, detail="student_id or session_id missing")
#
#     current_ui_sync["student_id"] = int(student_id)
#     current_ui_sync["session_id"] = int(session_id)
#
#     if completed:
#         current_ui_sync["completed"] = completed == "true"
#
#     if score:
#         current_ui_sync["score"] = int(score)
#
#     print(
#         f"[✓] UI Sync alındı: student_id={current_ui_sync['student_id']}, session_id={current_ui_sync['session_id']}, completed={current_ui_sync.get('completed')}, score={current_ui_sync.get('score')}")
#     return {"status": "ok", "data": current_ui_sync}

# @app.post("/gamesession/ui-sync")
# async def ui_sync_status(request: Request):
#     data = await request.json()
#     session_id = data.get("session_id")
#     student_id = data.get("student_id")
#     completed = data.get("completed", False)
#     score = data.get("score")
#
#     if session_id and completed and score is not None:
#         await database.execute(
#             """
#             UPDATE game_sessions
#             SET completed = 1, result_score = :score, updated_at = CURRENT_TIMESTAMP
#             WHERE session_id = :sid
#             """,
#             {"score": score, "sid": session_id}
#         )
#
#     return {
#         "session_id": session_id,
#         "student_id": student_id,
#         "completed": completed,
#         "score": score,
#     }

###################3333 ui-sync eski
# @app.post("/gamesession/ui-sync")
# async def ui_sync_status(request: Request):
#     data = await request.json()
#     session_id = data.get("session_id")
#     student_id = data.get("student_id")
#     completed = data.get("completed", False)
#     score = data.get("score")
#
#     # Session güncellemesi
#     if session_id and completed and score is not None:
#         await database.execute(
#             """
#             UPDATE game_sessions
#             SET completed = 1, score = :score, updated_at = CURRENT_TIMESTAMP
#             WHERE session_id = :sid
#             """,
#             {"score": score, "sid": session_id}
#         )
#
#     # Ek olarak: son durumu UI için ayrı tabloda sakla
#     await database.execute(
#         """
#         INSERT INTO UISyncStatus (student_id, session_id, completed, score, timestamp)
#         VALUES (:sid, :sess, :comp, :score, :ts)
#         """,
#         {
#             "sid": student_id,
#             "sess": session_id,
#             "comp": completed,
#             "score": score,
#             "ts": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
#         }
#     )
#
#     return {
#         "session_id": session_id,
#         "student_id": student_id,
#         "completed": completed,
#         "score": score,
#     }
#
# @app.post("/gamesession/ui-sync")
# async def ui_sync(data: UiSync):
#     ui_sync_status["last"] = data
#     return {"message": "UI sync status updated"}

# @app.get("/gamesession/ui-sync")
# async def get_ui_sync_status():
#     return ui_sync_status.get("last", {})
# Enhanced endpoint to get UI sync status
# @app.get("/gamesession/ui-sync-status")
# def get_ui_sync_status():
#     return current_ui_sync
# @app.get("/gamesession/ui-sync-status")
# async def ui_sync_status():
#     row = await database.fetch_one("""
#         SELECT session_id, student_id, game_id, completed, score
#         FROM game_sessions
#         WHERE completed = 1
#         ORDER BY updated_at DESC
#         LIMIT 1
#     """)
#     print("UI SYNC DEBUG:", row)
#     return row or {}

@app.get("/gamesession/ui-sync-status")
async def get_ui_sync_status(game_id: Optional[int] = None, student_ids: Optional[str] = None):
    """
    UI sync durumunu döndüren endpoint.
    Bu endpoint, UI'ın Unity'den gelen güncellemeleri görmesini sağlar.

    Args:
        game_id (Optional[int]): Oyun ID'si
        student_ids (Optional[str]): Virgülle ayrılmış öğrenci ID'leri
    """
    try:
        # Eğer game_id ve student_ids verilmişse, belirli öğrencilerin durumunu döndür
        if game_id and student_ids:
            student_id_list = [int(sid) for sid in student_ids.split(",")]

            # Tüm öğrencilerin durumunu al
            query = """
            SELECT student_id, score, completed, updated_at
            FROM game_sessions
            WHERE game_id = :gid AND student_id IN :sids
            ORDER BY updated_at DESC
            """

            # SQLite IN operatörü için liste formatını ayarla
            results = await database.fetch_all(
                query,
                {"gid": game_id, "sids": tuple(student_id_list)}
            )

            # Sonuçları işle - her öğrenci için en son kaydı al
            student_statuses = {}
            for row in results:
                student_id = row["student_id"]
                if student_id not in student_statuses:
                    student_statuses[student_id] = {
                        "student_id": student_id,
                        "score": row["score"],
                        "completed": row["completed"] == 1,
                        "updated_at": row["updated_at"]
                    }

            return student_statuses
        else:
            # Eski davranış - en son UI sync durumunu al
            result = await database.fetch_one(
                """
                SELECT student_id, score, completed, updated_at
                FROM UISyncStatus
                ORDER BY updated_at DESC
                LIMIT 1
                """
            )

            if not result:
                return {}

            # Sonucu JSON'a dönüştür
            return {
                "student_id": result["student_id"],
                "score": result["score"],
                "completed": result["completed"] == 1,
                "updated_at": result["updated_at"]
            }
    except Exception as e:
        logger.error(f"Error getting UI sync status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# @app.get("/gamesession/ui-sync-status")
# async def ui_sync_status():
#     row = await database.fetch_one("""
#         SELECT session_id, student_id, game_id, completed, score
#         FROM game_sessions
#         WHERE completed = 0 AND is_started = 1
#         ORDER BY updated_at DESC
#         LIMIT 1
#     """)
#     return row or {}
#


# Add an endpoint to manually force a UI sync
@app.post("/debug/force-ui-sync")
async def force_ui_sync(student_id: int, session_id: int, completed: bool = False, score: int = None):
    current_ui_sync["student_id"] = student_id
    current_ui_sync["session_id"] = session_id

    if completed:
        current_ui_sync["completed"] = completed

    if score is not None:
        current_ui_sync["score"] = score

    print(f"[✓] Force UI Sync: {current_ui_sync}")
    return {"status": "ok", "data": current_ui_sync}


# Add an endpoint to get detailed session info
@app.get("/gamesession/{session_id}/info")
async def get_session_info(session_id: int):
    for session in game_sessions:
        if session.session_id == session_id:
            return session

    raise HTTPException(status_code=404, detail="Session not found")

class GameSessionOut(BaseModel):
    student_id: int
    session_id: int
    result_score: int | None = None
    completed: bool

class GameActiveSessionOut(BaseModel):
    game_id: int
    student_id: int
    session_id: int
    result_score: int | None = None
    completed: bool
@app.get("/gamesessions", response_model=List[GameSessionOut])
async def get_sessions_for_game(game_id: int):
    rows = await database.fetch_all(
        """
        SELECT student_id, session_id, score AS result_score, completed
        FROM game_sessions
        WHERE game_id = :game_id
        """,
        {"game_id": game_id}
    )
    return rows

@app.get("/gamesessionsactive", response_model=List[GameActiveSessionOut])
async def get_sessions_for_activegame(user_id:int):
    rows = await database.fetch_all(
        """
        SELECT game_id, student_id, session_id, score as result_score, completed
        FROM game_sessions
        WHERE completed IS FALSE and is_started IS FALSE and user_id = :user_id
        """,
        values={"user_id": user_id}

    )
    return rows


# @app.post("/gamesession/{session_id}/end")
# async def end_game_session(session_id: int, request: Request):
#     data = await request.json()
#     result_score = data.get("result_score")
#     game_id = data.get("game_id")
#
#     await database.execute(
#         """
#         UPDATE game_sessions
#         SET score = :score,
#             completed = 1,
#             updated_at = :ts
#         WHERE session_id = :sid AND game_id = :gid
#         """,
#         {
#             "score": result_score,
#             "ts": datetime.utcnow(),
#             "sid": session_id,
#             "gid": game_id
#         }
#     )
#     return {"status": "ok", "session_id": session_id, "score": result_score}

@app.post("/gamesession/{session_id}/end")
async def end_game_session(session_id: int, payload: dict = Body(...)):
    try:
        score = payload.get("result_score")
        game_id = payload.get("game_id")

        logger.info(f"Ending session {session_id} with score {score} for game {game_id}")

        # Önce tüm sütunları seçerek sorguyu çalıştıralım
        query = "SELECT * FROM game_sessions WHERE session_id = :sid"
        logger.debug(f"Executing query: {query} with params: {{'sid': {session_id}}}")

        # Önce bu session'ın zaten tamamlanmış olup olmadığını kontrol et
        existing_session = await database.fetch_one(query, {"sid": session_id})

        # Sorgu sonucunu debug etmek için yazdıralım
        logger.debug(f"Query result columns: {existing_session.keys() if existing_session else 'None'}")
        logger.debug(f"Query result values: {dict(existing_session) if existing_session else 'None'}")

        if not existing_session:
            logger.warning(f"Session {session_id} not found")
            raise HTTPException(status_code=404, detail="Session not found")

        # Eğer session zaten tamamlanmışsa, tekrar işlem yapma
        if existing_session["completed"] == 1:
            logger.info(f"Session {session_id} already completed with score {existing_session['score']}")
            return {
                "status": "already completed",
                "session_id": session_id,
                "student_id": existing_session["student_id"],
                "score": existing_session["score"]
            }

        # is_started kontrolünü güvenli bir şekilde yapalım
        # Önce sütun adını kontrol edelim
        column_names = existing_session.keys()
        is_started_column = None
        for col in column_names:
            if col.lower() == "is_started":
                is_started_column = col
                break

        # Eğer is_started sütunu bulunduysa, kontrolü yapalım
        if is_started_column and existing_session[is_started_column] == 0:
            logger.warning(f"Session {session_id} was never started")
            raise HTTPException(status_code=400, detail="Game was never started")

        # Session'ı tamamla
        await database.execute(
            """
            UPDATE game_sessions 
            SET completed = 1, score = :score, updated_at = :now 
            WHERE session_id = :sid
            """,
            {"score": score, "sid": session_id, "now": datetime.utcnow()}
        )

        student_id = existing_session["student_id"]
        logger.info(f"Session {session_id} ended for student {student_id} with score {score}")

        # Oyun adını bul
        game_row = await database.fetch_one(
            "SELECT game_name FROM Games WHERE game_id = :gid", {"gid": game_id}
        )
        if not game_row:
            logger.warning(f"Game {game_id} not found")
            raise HTTPException(status_code=404, detail="Game not found")

        # Oyun etkilerini uygula
        await apply_game_impacts(student_id, game_row["game_name"], score)

        # UI sync durumunu güncelle
        await update_ui_sync_status(student_id, score, True)

        return {"status": "session ended", "session_id": session_id, "score": score}
    except Exception as e:
        logger.error(f"Error ending session {session_id}: {str(e)}")
        # Hata mesajını ve stack trace'i yazdıralım
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/admin/cleanup-incomplete-sessions")
async def cleanup_incomplete_sessions():
    """
    Tamamlanmamış oturumları temizleyen admin endpoint'i.
    Bu endpoint, belirli bir süreden daha eski olan tamamlanmamış oturumları temizler.
    """
    try:
        # 1 saatten daha eski olan tamamlanmamış oturumları temizle
        result = await database.execute(
            """
            DELETE FROM game_sessions 
            WHERE completed = 0 AND created_at < datetime('now', '-1 hour')
            """
        )

        return {"message": "Cleanup completed", "deleted_sessions": result}
    except Exception as e:
        logger.error(f"Error cleaning up incomplete sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


async def update_incomplete_sessions():
    """
    Mevcut tamamlanmamış oturumları güncelleyen script.
    Bu script, aynı öğrenci için hem tamamlanmış hem de tamamlanmamış oturumlar varsa,
    tamamlanmamış oturumları siler.
    """
    try:
        # Aynı öğrenci ve oyun için hem tamamlanmış hem de tamamlanmamış oturumları bul
        query = """
        SELECT s1.session_id, s1.student_id, s1.game_id
        FROM game_sessions s1
        JOIN game_sessions s2 ON s1.student_id = s2.student_id AND s1.game_id = s2.game_id
        WHERE s1.completed = 0 AND s2.completed = 1
        """

        incomplete_sessions = await database.fetch_all(query)

        for session in incomplete_sessions:
            # Bu tamamlanmamış oturumu sil
            await database.execute(
                "DELETE FROM game_sessions WHERE session_id = :sid",
                {"sid": session["session_id"]}
            )
            logger.info(
                f"Deleted incomplete session {session['session_id']} for student {session['student_id']}, game {session['game_id']}")

        return {"message": "Update completed", "updated_sessions": len(incomplete_sessions)}
    except Exception as e:
        logger.error(f"Error updating incomplete sessions: {str(e)}")
        return {"error": str(e)}


# Bu scripti çalıştırmak için bir endpoint ekleyin
@app.post("/admin/update-incomplete-sessions")
async def run_update_incomplete_sessions():
    result = await update_incomplete_sessions()
    return result

async def update_ui_sync_status(student_id, score, completed):
    """
    UI sync durumunu güncelleyen fonksiyon.
    Bu fonksiyon, UI'ın Unity'den gelen güncellemeleri görmesini sağlar.
    """
    try:
        logger.info(f"Updating UI sync status for student {student_id} with score {score}, completed: {completed}")

        # UI sync tablosunu güncelle
        await database.execute(
            """
            INSERT OR REPLACE INTO UISyncStatus (student_id, score, completed, updated_at)
            VALUES (:student_id, :score, :completed, :now)
            """,
            {
                "student_id": student_id,
                "score": score,
                "completed": 1 if completed else 0,
                "now": datetime.utcnow()
            }
        )

        logger.info(f"UI sync status updated successfully for student {student_id}")
        return True
    except Exception as e:
        logger.error(f"Error updating UI sync status: {str(e)}")
        return False

class GameSessionResponse(BaseModel):
    session_id: int
    student_id: int
    game_id: int
    is_started: bool = False
    completed: bool = False
    score: Optional[int] = None
    created_at: datetime

@app.get("/gamesession", response_model=Optional[GameSessionResponse])
async def get_next_session(game_id: int = Query(..., description="Game ID to filter sessions")):
    """
    Get the next student in queue for a game.
    Returns the oldest non-completed session for the specified game.
    """
    query = """
        SELECT session_id, student_id, game_id, is_started, completed, score, created_at
        FROM game_sessions
        WHERE game_id = :game_id AND completed = 0
        ORDER BY created_at ASC
        LIMIT 1
    """
    session = await database.fetch_one(query=query, values={"game_id": game_id})

    if not session:
        logger.info(f"No pending sessions found for game {game_id}")
        return None

    logger.info(f"Found next session {session['session_id']} for game {game_id}")
    return dict(session)
# @app.post("/gamesession/{session_id}/end")
# async def end_session(session_id: int,background_tasks: BackgroundTasks, result_score: int = Query(...), game_id: int = Query(...)):
#     for session in game_sessions:
#         if session.session_id == session_id:
#             if session.result_score is not None:
#                 raise HTTPException(status_code=400, detail="Session already ended")
#
#             session.result_score = result_score
#             session.is_active = False
#             print(f"✓ Session {session_id} tamamlandı → result_score = {result_score}")
#
#             print(f"[✓] Skor alındı → Student: {session.student_id}, Game: {game_id}, Score: {result_score}")
#
#             # ✅ Game adı veritabanından çekiliyor
#             game_row = await database.fetch_one(
#                 "SELECT game_name FROM Games WHERE game_id = :id",
#                 {"id": game_id}
#             )
#             if not game_row:
#                 raise HTTPException(status_code=404, detail="Game not found")
#
#             game_name = game_row["game_name"]
#             student_id = session.student_id
#
#             # ✅ apply_game_impacts arka planda çağrılır
#             background_tasks.add_task(apply_game_impacts, student_id, game_name, result_score)
#             print(">>> END_SESSION CALLED", session_id, result_score, game_id)
#
#             return {"status": "ended", "session_id": session_id}
#
#     raise HTTPException(status_code=404, detail="Session not found")

##########################################################################


@app.get("/games/{game_id}/recent-players")
async def get_recent_players_for_game(game_id: int):
    query = """
        SELECT 
          s.student_internal_id AS id, 
          s.name, 
          s.avatar, 
          gp.played_at, 
          gp.score
        FROM gameplays gp
        JOIN students s ON s.student_internal_id = gp.student_id
        WHERE gp.game_id = :game_id
        ORDER BY gp.played_at DESC
        LIMIT 10

    """
    rows = await database.fetch_all(query, {"game_id": game_id})
    return rows
@app.post("/games", response_model=Game)
async def create_game(payload: Game = Body(...)):
    values = payload.dict(exclude_unset=True)
    new_id = await database.execute(games_table.insert().values(**values))
    return await database.fetch_one(
        games_table.select().where(games_table.c.game_id == new_id)
    )

@app.put("/games/{game_id}", response_model=Game)
async def update_game(game_id: int = Path(...), payload: Game = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        games_table.update().where(games_table.c.game_id == game_id).values(**values)
    )
    row = await database.fetch_one(
        games_table.select().where(games_table.c.game_id == game_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Game not found")
    return row

@app.delete("/games/{game_id}", response_model=dict)
async def delete_game(game_id: int = Path(...)):
    await database.execute(
        games_table.delete().where(games_table.c.game_id == game_id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for GameSkills
# ------------------------------------------------------------------------------
@app.get("/games/{game_id}/skills", response_model=List[GameSkill])
async def list_game_skills(game_id: int = Path(...)):
    return await database.fetch_all(
        game_skills_table.select().where(game_skills_table.c.game_id == game_id)
    )

@app.post("/games/{game_id}/skills", response_model=GameSkill)
async def create_game_skill(game_id: int = Path(...), payload: GameSkill = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["game_id"] = game_id
    new_id = await database.execute(game_skills_table.insert().values(**values))
    return await database.fetch_one(
        game_skills_table.select().where(game_skills_table.c.id == new_id)
    )

@app.put("/games/{game_id}/skills/{id}", response_model=GameSkill)
async def update_game_skill(game_id: int = Path(...), id: int = Path(...), payload: GameSkill = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        game_skills_table.update().where(game_skills_table.c.id == id).values(**values)
    )
    row = await database.fetch_one(
        game_skills_table.select().where(game_skills_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Game skill not found")
    return row

@app.delete("/games/{game_id}/skills/{id}", response_model=dict)
async def delete_game_skill(game_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        game_skills_table.delete().where(game_skills_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for GameTargetSkills
# ------------------------------------------------------------------------------
@app.get("/games/{game_id}/target-skills", response_model=List[GameTargetSkill])
async def list_game_target_skills(game_id: int = Path(...)):
    return await database.fetch_all(
        game_target_skills_table.select().where(game_target_skills_table.c.game_id == game_id)
    )

@app.post("/games/{game_id}/target-skills", response_model=GameTargetSkill)
async def create_game_target_skill(game_id: int = Path(...), payload: GameTargetSkill = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["game_id"] = game_id
    new_id = await database.execute(game_target_skills_table.insert().values(**values))
    return await database.fetch_one(
        game_target_skills_table.select().where(game_target_skills_table.c.id == new_id)
    )

@app.put("/games/{game_id}/target-skills/{id}", response_model=GameTargetSkill)
async def update_game_target_skill(game_id: int = Path(...), id: int = Path(...), payload: GameTargetSkill = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        game_target_skills_table.update().where(game_target_skills_table.c.id == id).values(**values)
    )
    row = await database.fetch_one(
        game_target_skills_table.select().where(game_target_skills_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Game target skill not found")
    return row

@app.delete("/games/{game_id}/target-skills/{id}", response_model=dict)
async def delete_game_target_skill(game_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        game_target_skills_table.delete().where(game_target_skills_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for GameTargetSubjects
# ------------------------------------------------------------------------------
@app.get("/games/{game_id}/target-subjects", response_model=List[GameTargetSubject])
async def list_game_target_subjects(game_id: int = Path(...)):
    return await database.fetch_all(
        game_target_subjects_table.select().where(game_target_subjects_table.c.game_id == game_id)
    )

@app.post("/games/{game_id}/target-subjects", response_model=GameTargetSubject)
async def create_game_target_subject(game_id: int = Path(...), payload: GameTargetSubject = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["game_id"] = game_id
    new_id = await database.execute(game_target_subjects_table.insert().values(**values))
    return await database.fetch_one(
        game_target_subjects_table.select().where(game_target_subjects_table.c.id == new_id)
    )

@app.put("/games/{game_id}/target-subjects/{id}", response_model=GameTargetSubject)
async def update_game_target_subject(game_id: int = Path(...), id: int = Path(...), payload: GameTargetSubject = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        game_target_subjects_table.update().where(game_target_subjects_table.c.id == id).values(**values)
    )
    row = await database.fetch_one(
        game_target_subjects_table.select().where(game_target_subjects_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Game target subject not found")
    return row

@app.delete("/games/{game_id}/target-subjects/{id}", response_model=dict)
async def delete_game_target_subject(game_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        game_target_subjects_table.delete().where(game_target_subjects_table.c.id == id)
    )
    return {"deleted": True}
# api.py (part 5/6: lines 801–1000)

# ------------------------------------------------------------------------------
# CRUD Endpoints for Short‑Term Goals
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/short-term-goals", response_model=List[ShortTermGoal])
async def list_short_term_goals(student_id: int = Path(...)):
    return await database.fetch_all(
        short_term_goals_table.select().where(short_term_goals_table.c.student_id == student_id)
    )

@app.get("/short-term-goals/{goal_id}", response_model=ShortTermGoal)
async def get_short_term_goal(goal_id: int = Path(...)):
    row = await database.fetch_one(
        short_term_goals_table.select().where(short_term_goals_table.c.goal_id == goal_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Short‑Term Goal not found")
    return row

@app.post("/students/{student_id}/short-term-goals", response_model=ShortTermGoal)
async def create_short_term_goal(student_id: int = Path(...), payload: ShortTermGoal = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(short_term_goals_table.insert().values(**values))
    return await database.fetch_one(
        short_term_goals_table.select().where(short_term_goals_table.c.goal_id == new_id)
    )

@app.put("/short-term-goals/{goal_id}", response_model=ShortTermGoal)
async def update_short_term_goal(goal_id: int = Path(...), payload: ShortTermGoal = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        short_term_goals_table.update().where(short_term_goals_table.c.goal_id == goal_id).values(**values)
    )
    row = await database.fetch_one(
        short_term_goals_table.select().where(short_term_goals_table.c.goal_id == goal_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Short‑Term Goal not found")
    return row

@app.delete("/short-term-goals/{goal_id}", response_model=dict)
async def delete_short_term_goal(goal_id: int = Path(...)):
    await database.execute(
        short_term_goals_table.delete().where(short_term_goals_table.c.goal_id == goal_id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Medium‑Term Goals
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/medium-term-goals", response_model=List[MediumTermGoal])
async def list_medium_term_goals(student_id: int = Path(...)):
    return await database.fetch_all(
        medium_term_goals_table.select().where(medium_term_goals_table.c.student_id == student_id)
    )

@app.get("/medium-term-goals/{goal_id}", response_model=MediumTermGoal)
async def get_medium_term_goal(goal_id: int = Path(...)):
    row = await database.fetch_one(
        medium_term_goals_table.select().where(medium_term_goals_table.c.goal_id == goal_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Medium‑Term Goal not found")
    return row

@app.post("/students/{student_id}/medium-term-goals", response_model=MediumTermGoal)
async def create_medium_term_goal(student_id: int = Path(...), payload: MediumTermGoal = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(medium_term_goals_table.insert().values(**values))
    return await database.fetch_one(
        medium_term_goals_table.select().where(medium_term_goals_table.c.goal_id == new_id)
    )

@app.put("/medium-term-goals/{goal_id}", response_model=MediumTermGoal)
async def update_medium_term_goal(goal_id: int = Path(...), payload: MediumTermGoal = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        medium_term_goals_table.update().where(medium_term_goals_table.c.goal_id == goal_id).values(**values)
    )
    row = await database.fetch_one(
        medium_term_goals_table.select().where(medium_term_goals_table.c.goal_id == goal_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Medium‑Term Goal not found")
    return row

@app.delete("/medium-term-goals/{goal_id}", response_model=dict)
async def delete_medium_term_goal(goal_id: int = Path(...)):
    await database.execute(
        medium_term_goals_table.delete().where(medium_term_goals_table.c.goal_id == goal_id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Long‑Term Goals
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/long-term-goals", response_model=List[LongTermGoal])
async def list_long_term_goals(student_id: int = Path(...)):
    return await database.fetch_all(
        long_term_goals_table.select().where(long_term_goals_table.c.student_id == student_id)
    )

@app.get("/long-term-goals/{goal_id}", response_model=LongTermGoal)
async def get_long_term_goal(goal_id: int = Path(...)):
    row = await database.fetch_one(
        long_term_goals_table.select().where(long_term_goals_table.c.goal_id == goal_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Long‑Term Goal not found")
    return row

@app.post("/students/{student_id}/long-term-goals", response_model=LongTermGoal)
async def create_long_term_goal(student_id: int = Path(...), payload: LongTermGoal = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(long_term_goals_table.insert().values(**values))
    return await database.fetch_one(
        long_term_goals_table.select().where(long_term_goals_table.c.goal_id == new_id)
    )

@app.put("/long-term-goals/{goal_id}", response_model=LongTermGoal)
async def update_long_term_goal(goal_id: int = Path(...), payload: LongTermGoal = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        long_term_goals_table.update().where(long_term_goals_table.c.goal_id == goal_id).values(**values)
    )
    row = await database.fetch_one(
        long_term_goals_table.select().where(long_term_goals_table.c.goal_id == goal_id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Long‑Term Goal not found")
    return row

@app.delete("/long-term-goals/{goal_id}", response_model=dict)
async def delete_long_term_goal(goal_id: int = Path(...)):
    await database.execute(
        long_term_goals_table.delete().where(long_term_goals_table.c.goal_id == goal_id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Student Recommended Games
# ------------------------------------------------------------------------------
# @app.get("/students/{student_id}/recommended-games", response_model=List[StudentRecommendedGame])
# async def list_recommended_games(student_id: int = Path(...)):
#     return await database.fetch_all(
#         student_recommended_games_table.select().where(student_recommended_games_table.c.student_id == student_id)
#     )

@app.get("/students/{student_id}/recommended-games", response_model=List[dict])
async def get_recommended_games(student_id: int):
    rows = await database.fetch_all("SELECT game_id, reason FROM studentrecommendedgames WHERE student_id = :sid", {"sid": student_id})
    return [dict(row) for row in rows]

@app.get("/recommended-games/{id}", response_model=StudentRecommendedGame)
async def get_recommended_game(id: int = Path(...)):
    row = await database.fetch_one(
        student_recommended_games_table.select().where(student_recommended_games_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return row

@app.post("/students/{student_id}/recommended-games", response_model=StudentRecommendedGame)
async def create_recommended_game(student_id: int = Path(...), payload: StudentRecommendedGame = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(student_recommended_games_table.insert().values(**values))
    return await database.fetch_one(
        student_recommended_games_table.select().where(student_recommended_games_table.c.id == new_id)
    )

@app.put("/recommended-games/{id}", response_model=StudentRecommendedGame)
async def update_recommended_game(id: int = Path(...), payload: StudentRecommendedGame = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        student_recommended_games_table.update().where(student_recommended_games_table.c.id == id).values(**values)
    )
    row = await database.fetch_one(
        student_recommended_games_table.select().where(student_recommended_games_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return row

@app.delete("/recommended-games/{id}", response_model=dict)
async def delete_recommended_game(id: int = Path(...)):
    await database.execute(
        student_recommended_games_table.delete().where(student_recommended_games_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Monthly Progress
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/monthly-progress", response_model=List[MonthlyProgress])
async def list_monthly_progress(student_id: int = Path(...)):
    return await database.fetch_all(
        monthly_progress_table.select().where(monthly_progress_table.c.student_id == student_id)
    )

@app.get("/monthly-progress/{id}", response_model=MonthlyProgress)
async def get_monthly_progress(id: int = Path(...)):
    row = await database.fetch_one(
        monthly_progress_table.select().where(monthly_progress_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Monthly progress not found")
    return row

@app.post("/students/{student_id}/monthly-progress", response_model=MonthlyProgress)
async def create_monthly_progress(student_id: int = Path(...), payload: MonthlyProgress = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(monthly_progress_table.insert().values(**values))
    return await database.fetch_one(
        monthly_progress_table.select().where(monthly_progress_table.c.id == new_id)
    )

@app.put("/monthly-progress/{id}", response_model=MonthlyProgress)
async def update_monthly_progress(id: int = Path(...), payload: MonthlyProgress = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        monthly_progress_table.update().where(monthly_progress_table.c.id == id).values(**values)
    )
    row = await database.fetch_one(
        monthly_progress_table.select().where(monthly_progress_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Monthly progress not found")
    return row

@app.delete("/monthly-progress/{id}", response_model=dict)
async def delete_monthly_progress(id: int = Path(...)):
    await database.execute(
        monthly_progress_table.delete().where(monthly_progress_table.c.id == id)
    )
    return {"deleted": True}


@app.get("/analytics/performance")
async def get_performance_chart_data(time_range: str = "Last 30 Days"):
    if time_range == "Last 7 Days":
        data = [{"name": f"Day {i+1}", "score": 60 + i % 5} for i in range(7)]
    elif time_range == "Last 3 Months":
        data = [{"name": m, "score": 60 + i * 5} for i, m in enumerate(["Jan", "Feb", "Mar"])]
    else:
        data = [{"name": m, "score": 60 + i * 3} for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun"])]

    return {"data": data}

def get_time_range_sql(timeframe: str):
    now = datetime.now()
    if timeframe == "week":
        return now - timedelta(days=7)
    elif timeframe == "year":
        return now - timedelta(days=365)
    else:  # default: month
        return now - timedelta(days=30)


class GameUsageData(BaseModel):
    name: str
    plays: int


class GameUsageResponse(BaseModel):
    data: list[GameUsageData]

@app.get("/analytics/game-usage", response_model=GameUsageResponse)
async def get_game_usage(timeframe: str = "month"):
    after_date = get_time_range_sql(timeframe)

    j = join(game_plays_table, games_table, game_plays_table.c.game_id == games_table.c.game_id)

    query = (
        select(
            games_table.c.game_name.label("name"),
            func.count().label("plays")
        )
        .select_from(j)
        .where(game_plays_table.c.played_at >= after_date)
        .group_by(games_table.c.game_name)
        .order_by(func.count().desc())
    )

    rows = await database.fetch_all(query)
    return {"data": [dict(row) for row in rows]}


class TopPerformerItem(BaseModel):
    id: int
    name: str
    score: float
    avatar: str | None = None

class TopPerformerResponse(BaseModel):
    data: list[TopPerformerItem]

class UpdateScoreRequest(BaseModel):
    student_id: int
    subject: str
    new_score: float


@app.get("/analytics/top-performers", response_model=TopPerformerResponse)
async def get_top_performers(subject: str = Query("English")):
    # Subject-column eşlemesi
    subject_column_map = {
        "mathematics": "math_score",
        "english": "english_score",
        "science": "science_score",
        "design": "design_score",
        "physicaleducation": "education_score",
        "humanities": "human_score",
        "history": "history_score",
        "art": "art_score",
        "music": "music_score",
        "biology": "biology_score",
        "geography": "geography_score",
        "engineering": "engineering_score",
        "algorithm": "algorithm_score",
        "social": "social_score",
        "general": "general_score"
    }

    column = subject_column_map.get(subject.lower())

    if not column:
        # Tanınmayan subject için boş liste dönelim
        return {"data": []}

    query = f"""
        SELECT 
            s.student_internal_id AS id, 
            s.name, 
            s.avatar, 
            ps.{column} AS score
        FROM students s
        JOIN performance_scores ps ON ps.student_id = s.student_internal_id
        WHERE ps.{column} IS NOT NULL
        ORDER BY ps.{column} DESC
        LIMIT 5
    """

    rows = await database.fetch_all(query)

    # Eğer sonuç boşsa, boş array dönelim
    if not rows:
        return {"data": []}

    return {"data": [dict(row) for row in rows]}
# ------------------------------------------------------------------------------
# CRUD Endpoints for Student Game Performances
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/game-performances", response_model=List[StudentGamePerformance])
async def list_game_performances(student_id: int = Path(...)):
    return await database.fetch_all(
        student_game_performances_table.select().where(student_game_performances_table.c.student_id == student_id)
    )

@app.put("/analytics/update-score")
async def update_student_score(payload: UpdateScoreRequest):
    subject_column_map = {
        "mathematics": "math_score",
        "english": "english_score",
        "science": "science_score",
        "design": "design_score",
        "physicaleducation": "education_score",
        "humanities": "human_score",
        "history": "history_score",
        "art": "art_score",
        "music": "music_score",
        "biology": "biology_score",
        "geography": "geography_score",
        "engineering": "engineering_score",
        "algorithm": "algorithm_score",
        "social": "social_score",
        "general": "general_score"
    }

    column = subject_column_map.get(payload.subject.lower())

    if not column:
        raise HTTPException(status_code=400, detail="Invalid subject name.")

    query = f"""
        UPDATE performance_scores
        SET {column} = :new_score
        WHERE student_id = :student_id
    """

    await database.execute(query, {"new_score": payload.new_score, "student_id": payload.student_id})

    return {"message": f"Score updated successfully for {payload.subject}."}


@app.get("/game-performances/{id}", response_model=StudentGamePerformance)
async def get_game_performance(id: int = Path(...)):
    row = await database.fetch_one(
        student_game_performances_table.select().where(student_game_performances_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Game performance not found")
    return row

@app.post("/students/{student_id}/game-performances", response_model=StudentGamePerformance)
async def create_game_performance(student_id: int = Path(...), payload: StudentGamePerformance = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(student_game_performances_table.insert().values(**values))
    return await database.fetch_one(
        student_game_performances_table.select().where(student_game_performances_table.c.id == new_id)
    )

@app.put("/game-performances/{id}", response_model=StudentGamePerformance)
async def update_game_performance(id: int = Path(...), payload: StudentGamePerformance = Body(...)):
    values = payload.dict(exclude_unset=True)
    await database.execute(
        student_game_performances_table.update().where(student_game_performances_table.c.id == id).values(**values)
    )
    row = await database.fetch_one(
        student_game_performances_table.select().where(student_game_performances_table.c.id == id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Game performance not found")
    return row

@app.delete("/game-performances/{id}", response_model=dict)
async def delete_game_performance(id: int = Path(...)):
    await database.execute(
        student_game_performances_table.delete().where(student_game_performances_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Student Badges
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/badges", response_model=List[StudentBadge])
async def list_badges(student_id: int = Path(...)):
    return await database.fetch_all(
        student_badges_table.select().where(student_badges_table.c.student_id == student_id)
    )

@app.post("/students/{student_id}/badges", response_model=StudentBadge)
async def add_badge(student_id: int = Path(...), payload: StudentBadge = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(student_badges_table.insert().values(**values))
    return await database.fetch_one(
        student_badges_table.select().where(student_badges_table.c.id == new_id)
    )

@app.delete("/students/{student_id}/badges/{id}", response_model=dict)
async def remove_badge(student_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        student_badges_table.delete().where(student_badges_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Student Skills
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/skills", response_model=List[StudentSkill])
async def list_student_skills(student_id: int = Path(...)):
    return await database.fetch_all(
        student_skills_table.select().where(student_skills_table.c.student_id == student_id)
    )

@app.post("/students/{student_id}/skills", response_model=StudentSkill)
async def add_student_skill(student_id: int = Path(...), payload: StudentSkill = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(student_skills_table.insert().values(**values))
    return await database.fetch_one(
        student_skills_table.select().where(student_skills_table.c.id == new_id)
    )

@app.delete("/students/{student_id}/skills/{id}", response_model=dict)
async def remove_student_skill(student_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        student_skills_table.delete().where(student_skills_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Student Subject Scores
# ------------------------------------------------------------------------------
@app.get("/students/{student_id}/subject-scores", response_model=List[StudentSubjectScore])
async def list_subject_scores(student_id: int = Path(...)):
    return await database.fetch_all(
        student_subject_scores_table.select().where(student_subject_scores_table.c.student_id == student_id)
    )

@app.post("/students/{student_id}/subject-scores", response_model=StudentSubjectScore)
async def add_subject_score(student_id: int = Path(...), payload: StudentSubjectScore = Body(...)):
    values = payload.dict(exclude_unset=True)
    values["student_id"] = student_id
    new_id = await database.execute(student_subject_scores_table.insert().values(**values))
    return await database.fetch_one(
        student_subject_scores_table.select().where(student_subject_scores_table.c.id == new_id)
    )

@app.delete("/students/{student_id}/subject-scores/{id}", response_model=dict)
async def remove_subject_score(student_id: int = Path(...), id: int = Path(...)):
    await database.execute(
        student_subject_scores_table.delete().where(student_subject_scores_table.c.id == id)
    )
    return {"deleted": True}


# ------------------------------------------------------------------------------
# CRUD Endpoints for Game Plays
# ------------------------------------------------------------------------------
@app.get("/games/{game_id}/plays", response_model=List[GamePlay])
async def list_game_plays(game_id: int = Path(...)):
    return await database.fetch_all(
        game_plays_table.select().where(game_plays_table.c.game_id == game_id)
    )

@app.get("/students/{student_id}/game-plays", response_model=list[GamePlay])
async def get_student_game_plays(student_id: int):
    query = """
        SELECT id, game_id, student_id, score, played_at
        FROM gameplays
        WHERE student_id = :student_id
        ORDER BY played_at DESC
        LIMIT 10
    """
    rows = await database.fetch_all(query, {"student_id": student_id})
    return rows
updated_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

async def update_dashboard_stats():
    # Öğrenci, oyun, skor gibi sayıları hesapla
    student_count = await database.fetch_val("SELECT COUNT(*) FROM students")
    game_count = await database.fetch_val("SELECT COUNT(*) FROM games")
    avg_score = await database.fetch_val("SELECT AVG(score) FROM gameplays")

    # Update dashboard_stats tablosuna yaz
    await database.execute("""
        UPDATE dashboardstats
        SET
            total_students = :students,
            total_games = :games,
            average_score = :score,
            timestamp = :updated
        WHERE id = 1
    """, {
        "students": student_count,
        "games": game_count,
        "score": avg_score,
        "updated": updated_time
    })

# @app.post("/game-plays", response_model=GamePlay)
# async def create_game_play(payload: GamePlay = Body(...)):
#     values = payload.dict(exclude_unset=True, by_alias=False)
#     new_id = await database.execute(game_plays_table.insert().values(**values))
#     return await database.fetch_one(
#         game_plays_table.select().where(game_plays_table.c.id == new_id)
#     )

@app.post("/game-plays", response_model=GamePlay)
async def create_game_play(payload: GamePlayCreate = Body(...)):
    values = payload.dict(exclude_unset=True)
    new_score = values["score"]
    game_id = values["game_id"]

    # 1. Oyun oynama kaydı oluştur
    new_id = await database.execute(game_plays_table.insert().values(**values))

    # 2. Mevcut plays ve avg_score verisini al
    game = await database.fetch_one(
        games_table.select().where(games_table.c.game_id == game_id)
    )

    if game:
        old_plays = game["plays"] or 0
        old_avg = game["avg_score"] or 0.0

        new_plays = old_plays + 1
        new_score = Decimal(str(values["score"]))  # float'ı güvenli şekilde Decimal'e çevir

        ##new_avg_score = (old_avg * old_plays + new_score) / new_plays
        new_avg_score = (float(old_avg) * float(old_plays) + float(new_score)) / float(new_plays)

        # 3. Güncelleme yap
        await database.execute(
            games_table.update()
            .where(games_table.c.game_id == game_id)
            .values(
                plays=new_plays,
                avg_score=new_avg_score
            )
        )
        ################################## öğrenciye de ekle
        new_score = Decimal(str(values["score"]))

        # Öğrenci verisini al
        student = await database.fetch_one(
            students_table.select().where(students_table.c.student_internal_id == values["student_id"])
        )

        if student:
            old_played = student["games_played"] or 0
            old_avg = student["avg_score"] or Decimal("0.0")

            new_played = old_played + 1
            new_avg = (old_avg * old_played + new_score) / new_played

            await database.execute(
                students_table.update()
                .where(students_table.c.student_internal_id == values["student_id"])
                .values(
                    games_played=new_played,
                    avg_score=new_avg
                )
            )

    # 4. Yeni kayıtlı game_play kaydını dön
    record = await database.fetch_one(
        game_plays_table.select().where(game_plays_table.c.id == new_id)
    )
    game_row = await database.fetch_one(games_table.select().where(games_table.c.game_id == values["game_id"]))
    print(game_row)
    if game_row:
        await apply_game_impacts(values["student_id"], game_row["game_name"], values["score"])

    print("⏺ Payload:", payload)
    print("📥 INSERT values:", values)
    print("🎯 Game ID:", values.get("game_id"))
    print("📊 Skor:", values.get("score"))
    print("🧾 Yeni kayıt ID'si:", new_id)

    return GamePlay.construct(**record._mapping)

def safe_json_parse(value, fallback):
    try:
        if isinstance(value, str):
            return json.loads(value)
        elif isinstance(value, dict):
            return value
        return fallback
    except Exception as e:
        logger.warning(f"JSON parse error: {e}. Returning fallback.")
        return fallback


@app.delete("/game-plays/{id}", response_
