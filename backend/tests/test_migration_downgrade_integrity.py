"""
Alembic Migration Integrity Check
Fails the build if any migration script has an empty downgrade()
without explicit documentation of irreversibility and restore-based rollback.
"""

import ast
import os
import glob
import pytest

VERSIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "alembic", "versions")

def get_migration_files():
    pattern = os.path.join(VERSIONS_DIR, "*.py")
    return [f for f in glob.glob(pattern) if not f.endswith("__init__.py")]

@pytest.mark.parametrize("filepath", get_migration_files())
def test_migration_has_real_or_documented_downgrade(filepath):
    filename = os.path.basename(filepath)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    tree = ast.parse(content, filename=filename)
    downgrade_func = None
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name == "downgrade":
            downgrade_func = node
            break

    assert downgrade_func is not None, f"Migration {filename} is missing downgrade() function"

    # Check if downgrade() body is only `pass` or docstring + `pass`
    body_nodes = [
        stmt for stmt in downgrade_func.body
        if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant) and isinstance(stmt.value.value, str))
    ]

    is_empty = False
    if len(body_nodes) == 1 and isinstance(body_nodes[0], ast.Pass):
        is_empty = True
    elif len(body_nodes) == 0:
        is_empty = True

    if is_empty:
        # If downgrade is empty, it MUST document irreversibility and restore-based rollback
        has_documentation = (
            "IRREVERSIBLE" in content
            or "restore-based rollback" in content
        )
        assert has_documentation, (
            f"Migration {filename} has an empty downgrade() without documented "
            f"irreversibility and restore-based rollback procedure."
        )
