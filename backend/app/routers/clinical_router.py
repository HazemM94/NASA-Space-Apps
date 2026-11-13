from datetime import datetime, timezone
import json
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    AppError,
    consultation_rate_limiter,
    get_current_user,
    resolve_target_user_id,
)
from app.crud import compute_canonical_hmac
from app.database import get_db
from app.models import (
    AnomalyAlert,
    DiagnosticConsultation,
    MissionSyncReport,
    TelemetryReading,
    TraumaProtocol,
    TreatmentTask,
    User,
)
from app.rag_engine import CitationSchema, MaterializedTaskSchema, RAGService, get_rag_engine
from app.schemas import (
    ConsultationCreateRequest,
    ConsultationResponse,
    SyncReportCreateRequest,
    SyncReportResponse,
    SyncReportVerifyResponse,
    TraumaProtocolResponse,
)

router = APIRouter(tags=["Clinical RAG, Tasks, Trauma & Sync"])


@router.post("/consultations", response_model=ConsultationResponse, status_code=201)
async def create_consultation(
    payload: ConsultationCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    rag: RAGService = Depends(get_rag_engine),
) -> ConsultationResponse:
    consultation_rate_limiter.check(f"consult:{current_user.id}")
    target_uid = resolve_target_user_id(
        current_user, payload.target_user_id, allow_flight_surgeon=False
    )

    rag_result = await rag.diagnose(
        body_region=payload.body_region,
        symptom_query=payload.symptom_query,
        voice_stress_score=payload.voice_stress_score,
    )

    now = datetime.now(timezone.utc)
    consultation_id = str(uuid.uuid4())
    record = DiagnosticConsultation(
        id=consultation_id,
        user_id=target_uid,
        body_region=payload.body_region,
        symptom_query=payload.symptom_query,
        voice_stress_score=payload.voice_stress_score,
        ai_diagnosis=rag_result.ai_diagnosis,
        confidence_score=rag_result.confidence_score,
        execution_mode=rag_result.execution_mode,
        citations_json=json.dumps([c.model_dump() for c in rag_result.citations]),
        created_at=now,
    )
    db.add(record)

    for task_item in rag_result.generated_tasks:
        db.add(
            TreatmentTask(
                id=task_item.id,
                user_id=target_uid,
                consultation_id=consultation_id,
                countermeasure_id=task_item.countermeasure_id,
                task_type=task_item.task_type,
                title=task_item.title,
                instructions=task_item.instructions,
                scheduled_for=task_item.scheduled_for,
                is_completed=False,
            )
        )

    await db.commit()

    return ConsultationResponse(
        id=consultation_id,
        user_id=target_uid,
        body_region=payload.body_region,
        symptom_query=payload.symptom_query,
        voice_stress_score=payload.voice_stress_score,
        ai_diagnosis=rag_result.ai_diagnosis,
        confidence_score=rag_result.confidence_score,
        execution_mode=rag_result.execution_mode,
        citations=rag_result.citations,
        generated_tasks=rag_result.generated_tasks,
        created_at=now,
    )


@router.get("/consultations", response_model=List[ConsultationResponse])
async def list_consultations(
    user_id: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ConsultationResponse]:
    target_uid = resolve_target_user_id(current_user, user_id, allow_flight_surgeon=True)
    rows = (
        await db.execute(
            select(DiagnosticConsultation)
            .where(DiagnosticConsultation.user_id == target_uid)
            .order_by(DiagnosticConsultation.created_at.desc())
        )
    ).scalars().all()

    results: List[ConsultationResponse] = []
    for row in rows:
        tasks = (
            await db.execute(
                select(TreatmentTask).where(TreatmentTask.consultation_id == row.id)
            )
        ).scalars().all()
        results.append(
            ConsultationResponse(
                id=row.id,
                user_id=row.user_id,
                body_region=row.body_region,
                symptom_query=row.symptom_query,
                voice_stress_score=row.voice_stress_score,
                ai_diagnosis=row.ai_diagnosis,
                confidence_score=row.confidence_score,
                execution_mode=row.execution_mode,
                citations=[CitationSchema(**c) for c in json.loads(row.citations_json)],
                generated_tasks=[
                    MaterializedTaskSchema.model_validate(t, from_attributes=True)
                    for t in tasks
                ],
                created_at=row.created_at,
            )
        )
    return results


@router.get("/tasks", response_model=List[MaterializedTaskSchema])
async def list_tasks(
    user_id: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[MaterializedTaskSchema]:
    target_uid = resolve_target_user_id(current_user, user_id, allow_flight_surgeon=True)
    rows = (
        await db.execute(
            select(TreatmentTask)
            .where(TreatmentTask.user_id == target_uid)
            .order_by(TreatmentTask.scheduled_for.asc())
        )
    ).scalars().all()
    return [MaterializedTaskSchema.model_validate(r, from_attributes=True) for r in rows]


@router.patch("/tasks/{task_id}/complete")
async def complete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    task = (
        await db.execute(select(TreatmentTask).where(TreatmentTask.id == task_id))
    ).scalar_one_or_none()
    if task is None:
        raise AppError(status.HTTP_404_NOT_FOUND, "TASK_NOT_FOUND", "Task not found.")

    resolve_target_user_id(current_user, task.user_id, allow_flight_surgeon=False)
    task.is_completed = True
    task.completed_at = datetime.now(timezone.utc)
    await db.commit()
    return {
        "id": task.id,
        "is_completed": True,
        "completed_at": task.completed_at.isoformat(),
    }


@router.get("/trauma-protocols", response_model=List[TraumaProtocolResponse])
async def get_trauma_protocols(
    db: AsyncSession = Depends(get_db),
) -> List[TraumaProtocolResponse]:
    """Public zero-auth endpoint so emergency overrides never fail on expired tokens."""
    rows = (await db.execute(select(TraumaProtocol))).scalars().all()
    return [
        TraumaProtocolResponse(
            id=r.id,
            code_name=r.code_name,
            title=r.title,
            body_region=r.body_region,
            steps=json.loads(r.steps_json),
            nasa_reference=r.nasa_reference,
        )
        for r in rows
    ]


@router.post("/reports/sync", response_model=SyncReportResponse, status_code=201)
async def create_sync_report(
    payload: SyncReportCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SyncReportResponse:
    target_uid = resolve_target_user_id(
        current_user, payload.target_user_id, allow_flight_surgeon=False
    )
    target_user = (
        await db.execute(select(User).where(User.id == target_uid))
    ).scalar_one_or_none()
    if target_user is None:
        raise AppError(status.HTTP_404_NOT_FOUND, "USER_NOT_FOUND", "Target user not found.")

    tel_count = (
        await db.execute(
            select(func.count(TelemetryReading.id)).where(TelemetryReading.user_id == target_uid)
        )
    ).scalar_one()
    alert_count = (
        await db.execute(
            select(func.count(AnomalyAlert.id)).where(
                AnomalyAlert.user_id == target_uid,
                AnomalyAlert.is_acknowledged.is_(False),
            )
        )
    ).scalar_one()
    consult_count = (
        await db.execute(
            select(func.count(DiagnosticConsultation.id)).where(
                DiagnosticConsultation.user_id == target_uid
            )
        )
    ).scalar_one()
    pending_tasks = (
        await db.execute(
            select(func.count(TreatmentTask.id)).where(
                TreatmentTask.user_id == target_uid,
                TreatmentTask.is_completed.is_(False),
            )
        )
    ).scalar_one()

    now = datetime.now(timezone.utc)
    summary_dict = {
        "astronaut_id": target_user.id,
        "astronaut_name": target_user.full_name,
        "telemetry_samples_count": tel_count,
        "active_anomalies_count": alert_count,
        "consultations_count": consult_count,
        "pending_tasks_count": pending_tasks,
        "snapshot_utc": now.isoformat(),
    }
    canonical_json, hmac_digest = compute_canonical_hmac(summary_dict)

    report_id = str(uuid.uuid4())
    report_row = MissionSyncReport(
        id=report_id,
        user_id=target_uid,
        generated_by=current_user.id,
        integrity_hmac=hmac_digest,
        summary_json=canonical_json,
        sync_status="QUEUED",
        created_at=now,
    )
    db.add(report_row)
    await db.commit()

    return SyncReportResponse(
        id=report_id,
        user_id=target_uid,
        generated_by=current_user.id,
        integrity_hmac=hmac_digest,
        summary=summary_dict,
        sync_status="QUEUED",
        created_at=now,
    )


@router.get("/reports", response_model=List[SyncReportResponse])
async def list_sync_reports(
    user_id: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[SyncReportResponse]:
    stmt = select(MissionSyncReport).order_by(MissionSyncReport.created_at.desc())
    if current_user.role == "ASTRONAUT":
        if user_id and user_id != current_user.id:
            raise AppError(
                status.HTTP_403_FORBIDDEN,
                "FORBIDDEN_OWNERSHIP",
                "Astronauts may only view their own sync reports.",
            )
        stmt = stmt.where(MissionSyncReport.user_id == current_user.id)
    elif user_id:
        stmt = stmt.where(MissionSyncReport.user_id == user_id)

    rows = (await db.execute(stmt)).scalars().all()
    return [
        SyncReportResponse(
            id=r.id,
            user_id=r.user_id,
            generated_by=r.generated_by,
            integrity_hmac=r.integrity_hmac,
            summary=json.loads(r.summary_json),
            sync_status=r.sync_status,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/reports/{report_id}/verify", response_model=SyncReportVerifyResponse)
async def verify_sync_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SyncReportVerifyResponse:
    row = (
        await db.execute(select(MissionSyncReport).where(MissionSyncReport.id == report_id))
    ).scalar_one_or_none()
    if row is None:
        raise AppError(status.HTTP_404_NOT_FOUND, "REPORT_NOT_FOUND", "Sync report not found.")

    resolve_target_user_id(current_user, row.user_id, allow_flight_surgeon=True)
    summary_dict = json.loads(row.summary_json)
    _, computed_hmac = compute_canonical_hmac(summary_dict)

    return SyncReportVerifyResponse(
        report_id=row.id,
        verified=(computed_hmac == row.integrity_hmac),
        stored_hmac=row.integrity_hmac,
        computed_hmac=computed_hmac,
    )


@router.post("/reports/{report_id}/tamper-demo")
async def tamper_sync_report_demo(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    row = (
        await db.execute(select(MissionSyncReport).where(MissionSyncReport.id == report_id))
    ).scalar_one_or_none()
    if row is None:
        raise AppError(status.HTTP_404_NOT_FOUND, "REPORT_NOT_FOUND", "Sync report not found.")

    resolve_target_user_id(current_user, row.user_id, allow_flight_surgeon=True)
    summary_dict = json.loads(row.summary_json)
    summary_dict["notes"] = f"[TAMPERED] {summary_dict.get('notes', '')}"
    row.summary_json = json.dumps(summary_dict)
    await db.commit()

    return {"report_id": row.id, "tampered": True}

