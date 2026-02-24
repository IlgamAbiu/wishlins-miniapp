"""add booked_by_user_id to wishes

Revision ID: 009
Revises: 008
Create Date: 2026-02-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = '009'
down_revision: Union[str, None] = '008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'wishes',
        sa.Column(
            'booked_by_user_id',
            UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='SET NULL'),
            nullable=True,
        )
    )
    op.create_index('ix_wishes_booked_by_user_id', 'wishes', ['booked_by_user_id'])


def downgrade() -> None:
    op.drop_index('ix_wishes_booked_by_user_id', table_name='wishes')
    op.drop_column('wishes', 'booked_by_user_id')
