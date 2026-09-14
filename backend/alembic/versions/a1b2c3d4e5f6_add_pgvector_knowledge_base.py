"""add_pgvector_knowledge_base

Revision ID: a1b2c3d4e5f6
Revises: 2658122dca47
Create Date: 2026-09-14 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '2658122dca47'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Enable pgvector extension and create knowledge_base table."""
    # Enable pgvector — no-op if already enabled; silently skipped on SQLite.
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    except Exception:
        # SQLite (offline dev) does not support this; skip gracefully.
        pass

    # Create knowledge_base table for RAG document storage.
    op.create_table(
        'knowledge_base',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('topic', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        # Store embedding as JSON array for SQLite compatibility;
        # pgvector column type is applied via the ORM model on Postgres.
        sa.Column('embedding_json', sa.Text(), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_knowledge_base_id'), 'knowledge_base', ['id'], unique=False)
    op.create_index(op.f('ix_knowledge_base_topic'), 'knowledge_base', ['topic'], unique=False)

    # Add native vector column on Postgres only (skipped silently on SQLite).
    try:
        op.add_column(
            'knowledge_base',
            sa.Column('embedding', sa.Text(), nullable=True),  # placeholder type
        )
        op.execute("ALTER TABLE knowledge_base ALTER COLUMN embedding TYPE vector(1536) USING NULL::vector(1536)")
        # IVFFlat index for approximate nearest-neighbour search.
        op.execute(
            "CREATE INDEX IF NOT EXISTS ix_knowledge_base_embedding "
            "ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50)"
        )
    except Exception:
        # SQLite or pgvector not installed — skip vector column; app degrades gracefully.
        pass


def downgrade() -> None:
    """Drop knowledge_base table."""
    op.drop_index(op.f('ix_knowledge_base_topic'), table_name='knowledge_base')
    op.drop_index(op.f('ix_knowledge_base_id'), table_name='knowledge_base')
    op.drop_table('knowledge_base')
