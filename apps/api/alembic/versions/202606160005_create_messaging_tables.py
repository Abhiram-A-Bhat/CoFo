"""create messaging tables

Revision ID: 202606160005
Revises: 202606160004
Create Date: 2026-06-16 00:05:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202606160005"
down_revision: str | None = "202606160004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "conversations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("participant_one_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("participant_two_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "participant_one_id <> participant_two_id",
            name="ck_conversation_distinct_participants",
        ),
        sa.ForeignKeyConstraint(["participant_one_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["participant_two_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "participant_one_id",
            "participant_two_id",
            name="uq_conversation_participants",
        ),
    )
    op.create_index(
        op.f("ix_conversations_participant_one_id"),
        "conversations",
        ["participant_one_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_conversations_participant_two_id"),
        "conversations",
        ["participant_two_id"],
        unique=False,
    )

    op.create_table(
        "messages",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sender_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_messages_conversation_id"), "messages", ["conversation_id"])
    op.create_index(op.f("ix_messages_sender_id"), "messages", ["sender_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_messages_sender_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_conversation_id"), table_name="messages")
    op.drop_table("messages")
    op.drop_index(
        op.f("ix_conversations_participant_two_id"),
        table_name="conversations",
    )
    op.drop_index(
        op.f("ix_conversations_participant_one_id"),
        table_name="conversations",
    )
    op.drop_table("conversations")
