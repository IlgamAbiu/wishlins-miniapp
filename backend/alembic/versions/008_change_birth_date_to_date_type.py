"""Change birth_date to Date type

Revision ID: 008
Revises: 007
Create Date: 2026-02-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column if it doesn't exist
    # PostgreSQL: alter column type from TIMESTAMP to DATE
    # This will truncate the time portion, keeping only the date
    op.execute("""
        DO $$
        BEGIN
            -- Check if column exists
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'users'
                AND column_name = 'birth_date'
            ) THEN
                -- Column exists, change type from TIMESTAMP to DATE
                ALTER TABLE users
                ALTER COLUMN birth_date TYPE DATE
                USING birth_date::DATE;
            ELSE
                -- Column doesn't exist, create it as DATE
                ALTER TABLE users
                ADD COLUMN birth_date DATE;
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # Change back from DATE to TIMESTAMP WITH TIME ZONE
    op.alter_column(
        "users",
        "birth_date",
        type_=sa.DateTime(timezone=True),
        existing_type=sa.Date(),
        existing_nullable=True,
    )
