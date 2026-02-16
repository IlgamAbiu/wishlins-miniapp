"""remove store from wishes

Revision ID: 006_remove_store
Revises: 005_add_priority_and_store_to_wishes
Create Date: 2026-02-16 12:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '006_remove_store'
down_revision: Union[str, None] = '005_add_priority_and_store_to_wishes'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('wishes', 'store')


def downgrade() -> None:
    op.add_column('wishes', sa.Column('store', sa.String(length=255), nullable=True))
