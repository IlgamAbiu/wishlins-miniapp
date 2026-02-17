"""Add priority and store fields to wishes table

Revision ID: 005
Revises: 004
Create Date: 2026-02-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM type for priority
    priority_enum = postgresql.ENUM('just_want', 'really_want', name='wish_priority')
    priority_enum.create(op.get_bind())

    # Add priority column (required field, default to 'just_want')
    op.add_column(
        "wishes",
        sa.Column(
            "priority",
            postgresql.ENUM('just_want', 'really_want', name='wish_priority'),
            nullable=False,
            server_default='just_want'
        ),
    )

    # Add store column (optional field, auto-extracted from link)
    op.add_column(
        "wishes",
        sa.Column("store", sa.String(255), nullable=True),
    )

    # Add index for priority to optimize sorting/filtering
    op.create_index("ix_wishes_priority", "wishes", ["priority"])


def downgrade() -> None:
    # Drop index
    op.drop_index("ix_wishes_priority", table_name="wishes")

    # Drop columns
    op.drop_column("wishes", "store")
    op.drop_column("wishes", "priority")

    # Drop ENUM type
    priority_enum = postgresql.ENUM('just_want', 'really_want', name='wish_priority')
    priority_enum.drop(op.get_bind())
