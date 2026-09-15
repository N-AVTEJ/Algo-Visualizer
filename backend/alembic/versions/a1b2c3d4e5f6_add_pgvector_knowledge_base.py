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
    # ------------------------------------------------------------------
    # Step 1: Enable the pgvector extension.
    # CREATE EXTENSION cannot run inside a transaction block on Postgres,
    # so we use a raw DBAPI connection in AUTOCOMMIT mode.
    # ------------------------------------------------------------------
    bind = op.get_bind()
    try:
        connection = bind.connection  # raw psycopg2 connection
        old_isolation = connection.isolation_level
        connection.set_isolation_level(0)  # AUTOCOMMIT
        cursor = connection.cursor()
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cursor.close()
        connection.set_isolation_level(old_isolation)
    except Exception:
        # SQLite (offline dev) or pgvector not installed — skip gracefully.
        pass

    # ------------------------------------------------------------------
    # Step 2: Create the knowledge_base table.
    # ------------------------------------------------------------------
    op.create_table(
        'knowledge_base',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('topic', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        # embedding_json stores the raw float list as JSON text.
        # The native vector column is added in step 3 on Postgres only.
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

    # ------------------------------------------------------------------
    # Step 3: Add the native vector column + IVFFlat index (Postgres only).
    # ------------------------------------------------------------------
    try:
        op.execute(
            "ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS embedding vector(1536)"
        )
        op.execute(
            "CREATE INDEX IF NOT EXISTS ix_knowledge_base_embedding "
            "ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50)"
        )
    except Exception:
        # pgvector not installed or SQLite — skip vector column entirely.
        pass


def downgrade() -> None:
    """Drop knowledge_base table."""
    op.drop_index(op.f('ix_knowledge_base_topic'), table_name='knowledge_base')
    op.drop_index(op.f('ix_knowledge_base_id'), table_name='knowledge_base')
    op.drop_table('knowledge_base')
