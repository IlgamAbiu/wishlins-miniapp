"""Add wishes table and update wishlists fields

Revision ID: 003
Revises: 002
Create Date: 2026-02-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to wishlists table
    op.add_column(
        "wishlists",
        sa.Column("emoji", sa.String(10), nullable=True),
    )
    op.add_column(
        "wishlists",
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "wishlists",
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default="false"),
    )

    # Create wishes table
    op.create_table(
        "wishes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "wishlist_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("wishlists.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("link", sa.String(2048), nullable=True),
        sa.Column("image_url", sa.String(2048), nullable=True),
        sa.Column("price", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(3), nullable=True),
        sa.Column("is_booked", sa.Boolean(), default=False, nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_wishes_wishlist_id", "wishes", ["wishlist_id"])


def downgrade() -> None:
    # Drop wishes table
    op.drop_index("ix_wishes_wishlist_id", table_name="wishes")
    op.drop_table("wishes")

    # Remove columns from wishlists table
    op.drop_column("wishlists", "is_default")
    op.drop_column("wishlists", "event_date")
    op.drop_column("wishlists", "emoji")
