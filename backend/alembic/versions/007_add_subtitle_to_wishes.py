"""add subtitle to wishes

Revision ID: 007
Revises: 006
Create Date: 2026-02-16 13:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('wishes', sa.Column('subtitle', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('wishes', 'subtitle')
