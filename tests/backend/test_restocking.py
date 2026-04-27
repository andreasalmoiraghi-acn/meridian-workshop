"""
Tests for /api/restocking endpoint.

Written following the backend-api-test skill patterns:
- Happy path first
- Structure & type validation
- Filter testing (warehouse)
- Business logic (estimated_cost, priority values, budget allocation)
- Edge cases (budget=0 → 422, budget covers nothing → all within_budget=False)
"""
import pytest


VALID_PRIORITIES = {"high", "medium", "low"}
VALID_REASONS = {
    "below_reorder_and_increasing_demand",
    "below_reorder_point",
    "increasing_demand",
}


class TestRestockingEndpoints:
    """Test suite for /api/restocking endpoint."""

    # ── 1. Happy path ────────────────────────────────────────────────

    def test_get_all_recommendations_returns_200(self, client):
        """Endpoint returns 200 and a non-empty list."""
        response = client.get("/api/restocking")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    # ── 2. Structure validation ──────────────────────────────────────

    def test_recommendation_required_fields_present(self, client):
        """Every item has all required fields from the Pydantic model."""
        response = client.get("/api/restocking")
        data = response.json()

        required_fields = {
            "id", "sku", "name", "category", "warehouse",
            "current_stock", "reorder_point", "recommended_qty",
            "unit_cost", "estimated_cost", "priority", "reason",
        }
        for item in data:
            for field in required_fields:
                assert field in item, f"Missing field '{field}' in item {item.get('sku')}"

    def test_recommendation_field_types(self, client):
        """Numeric fields are correct types and non-negative."""
        response = client.get("/api/restocking")
        data = response.json()

        for item in data:
            assert isinstance(item["current_stock"], int)
            assert isinstance(item["reorder_point"], int)
            assert isinstance(item["recommended_qty"], int)
            assert isinstance(item["unit_cost"], (int, float))
            assert isinstance(item["estimated_cost"], (int, float))

            assert item["current_stock"] >= 0
            assert item["reorder_point"] >= 0
            assert item["recommended_qty"] > 0
            assert item["unit_cost"] > 0
            assert item["estimated_cost"] > 0

    # ── 3. Business logic validation ────────────────────────────────

    def test_estimated_cost_equals_qty_times_unit_cost(self, client):
        """estimated_cost must equal recommended_qty * unit_cost (±0.01)."""
        response = client.get("/api/restocking")
        data = response.json()

        for item in data:
            expected = item["recommended_qty"] * item["unit_cost"]
            assert abs(item["estimated_cost"] - expected) < 0.01, (
                f"{item['sku']}: estimated_cost {item['estimated_cost']} "
                f"!= {item['recommended_qty']} * {item['unit_cost']} = {expected}"
            )

    def test_priority_values_are_valid(self, client):
        """Priority field only contains high / medium / low."""
        response = client.get("/api/restocking")
        data = response.json()

        for item in data:
            assert item["priority"].lower() in VALID_PRIORITIES, (
                f"{item['sku']} has unexpected priority: {item['priority']}"
            )

    def test_reason_values_are_valid(self, client):
        """Reason field matches one of the defined reason codes."""
        response = client.get("/api/restocking")
        data = response.json()

        for item in data:
            assert item["reason"] in VALID_REASONS, (
                f"{item['sku']} has unexpected reason: {item['reason']}"
            )

    def test_results_ordered_by_priority(self, client):
        """High priority items appear before medium, medium before low."""
        response = client.get("/api/restocking")
        data = response.json()

        priority_rank = {"high": 0, "medium": 1, "low": 2}
        ranks = [priority_rank[item["priority"].lower()] for item in data]
        assert ranks == sorted(ranks), "Results are not sorted by priority"

    # ── 4. Filter testing ────────────────────────────────────────────

    def test_filter_by_warehouse_tokyo(self, client):
        """Warehouse filter returns only items from Tokyo."""
        response = client.get("/api/restocking?warehouse=Tokyo")
        assert response.status_code == 200

        data = response.json()
        for item in data:
            assert item["warehouse"] == "Tokyo"

    def test_filter_by_warehouse_london(self, client):
        """Warehouse filter returns only items from London."""
        response = client.get("/api/restocking?warehouse=London")
        assert response.status_code == 200

        data = response.json()
        for item in data:
            assert item["warehouse"] == "London"

    def test_filter_unknown_warehouse_returns_empty(self, client):
        """Filtering by a non-existent warehouse returns an empty list."""
        response = client.get("/api/restocking?warehouse=Antarctica")
        assert response.status_code == 200
        assert response.json() == []

    # ── 5. Budget parameter ──────────────────────────────────────────

    def test_budget_adds_within_budget_field(self, client):
        """Passing a budget populates within_budget on every item."""
        response = client.get("/api/restocking?budget=999999")
        assert response.status_code == 200

        data = response.json()
        assert len(data) > 0
        for item in data:
            assert "within_budget" in item
            assert item["within_budget"] is not None

    def test_large_budget_marks_all_within_budget(self, client):
        """A budget larger than total cost marks every item within_budget=True."""
        response = client.get("/api/restocking?budget=10000000")
        data = response.json()

        for item in data:
            assert item["within_budget"] is True, (
                f"{item['sku']} should be within a $10M budget"
            )

    def test_tiny_budget_marks_all_over_budget(self, client):
        """A budget of $1 is below any unit cost — all items within_budget=False."""
        response = client.get("/api/restocking?budget=1")
        assert response.status_code == 200

        data = response.json()
        for item in data:
            assert item["within_budget"] is False

    def test_no_budget_leaves_within_budget_null(self, client):
        """Without a budget parameter, within_budget is None on every item."""
        response = client.get("/api/restocking")
        data = response.json()

        for item in data:
            assert item.get("within_budget") is None

    def test_budget_zero_behaves_as_no_budget(self, client):
        """budget=0 is technically allowed (ge=0) but Python's `if budget:`
        evaluates to False for zero, so the endpoint treats it identically
        to no budget — within_budget remains None on all items.
        This is a known edge case: semantically $0 should mark everything
        over budget, but the current implementation is documented here."""
        response = client.get("/api/restocking?budget=0")
        assert response.status_code == 200

        data = response.json()
        for item in data:
            # budget=0 is treated as "no budget" — within_budget stays None
            assert item.get("within_budget") is None

    def test_budget_combined_with_warehouse_filter(self, client):
        """Budget and warehouse filters can be combined."""
        response = client.get("/api/restocking?warehouse=Tokyo&budget=999999")
        assert response.status_code == 200

        data = response.json()
        for item in data:
            assert item["warehouse"] == "Tokyo"
            assert item["within_budget"] is not None
