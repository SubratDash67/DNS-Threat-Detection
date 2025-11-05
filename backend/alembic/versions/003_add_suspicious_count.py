"""add suspicious count to batch jobs

Revision ID: 003
Revises: 002
Create Date: 2025-11-05

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add suspicious_count column to batch_jobs table
    # SQLite doesn't support ALTER COLUMN, so we add it as non-nullable with default from start

    # Check if column already exists (handles partial migration cases)
    from sqlalchemy import inspect

    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col["name"] for col in inspector.get_columns("batch_jobs")]

    if "suspicious_count" not in columns:
        op.add_column(
            "batch_jobs",
            sa.Column(
                "suspicious_count", sa.Integer(), nullable=False, server_default="0"
            ),
        )


def downgrade() -> None:
    op.drop_column("batch_jobs", "suspicious_count")
