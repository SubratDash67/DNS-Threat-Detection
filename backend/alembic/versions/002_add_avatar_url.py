"""Add avatar_url to users

Revision ID: 002_add_avatar_url
Revises: 001_initial_migration
Create Date: 2025-11-05

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add avatar_url column to users table
    op.add_column(
        "users", sa.Column("avatar_url", sa.String(length=500), nullable=True)
    )


def downgrade() -> None:
    # Remove avatar_url column from users table
    op.drop_column("users", "avatar_url")
