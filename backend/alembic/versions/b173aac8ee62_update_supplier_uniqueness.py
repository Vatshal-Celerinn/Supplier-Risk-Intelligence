"""update supplier uniqueness

Revision ID: b173aac8ee62
Revises: 4e4714ec3a4a
Create Date: 2026-02-19 13:21:16.844927

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b173aac8ee62'
down_revision: Union[str, Sequence[str], None] = '4e4714ec3a4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_constraint('uq_supplier_org_normalized', 'suppliers', type_='unique')
    op.create_unique_constraint(
        'uq_supplier_org_name_country',
        'suppliers',
        ['organization_id', 'normalized_name', 'country']
    )



def downgrade():
    op.drop_constraint('uq_supplier_org_name_country', 'suppliers', type_='unique')

    op.create_unique_constraint(
        'uq_supplier_org_normalized',
        'suppliers',
        ['organization_id', 'normalized_name']
    )
