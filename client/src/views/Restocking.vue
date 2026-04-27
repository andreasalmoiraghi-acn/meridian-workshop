<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.subtitle') }}</p>
    </div>

    <div class="budget-bar card">
      <label class="budget-label">{{ t('restocking.budgetLabel') }}</label>
      <div class="budget-controls">
        <input
          v-model.number="budgetInput"
          type="number"
          min="1"
          step="1000"
          :placeholder="t('restocking.budgetPlaceholder')"
          class="budget-input"
          @keydown.enter="applyBudget"
        />
        <button
          class="btn-primary"
          :disabled="loading || !budgetInput || budgetInput <= 0"
          @click="applyBudget"
        >
          {{ t('restocking.applyBudget') }}
        </button>
        <button v-if="activeBudget" class="btn-secondary" :disabled="loading" @click="clearBudget">
          {{ t('restocking.clearBudget') }}
        </button>
      </div>
      <span v-if="activeBudget" class="budget-active-badge">
        {{ t('restocking.budgetActiveLabel') }}: {{ formatCurrency(activeBudget, currentCurrency.value) }}
      </span>
    </div>

    <div v-if="loading" class="loading">{{ t('restocking.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card warning">
          <div class="stat-label">{{ t('restocking.totalItems') }}</div>
          <div class="stat-value">{{ recommendations.length }}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">{{ t('restocking.highPriority') }}</div>
          <div class="stat-value">{{ highPriorityCount }}</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">{{ t('restocking.totalCost') }}</div>
          <div class="stat-value cost-value">{{ formatCurrency(totalEstimatedCost, currentCurrency.value) }}</div>
        </div>
        <div v-if="activeBudget" class="stat-card success">
          <div class="stat-label">{{ t('restocking.withinBudget') }}</div>
          <div class="stat-value">{{ withinBudgetCount }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.tableTitle') }}</h3>
        </div>
        <div v-if="recommendations.length === 0" class="empty-state">
          <p>{{ t('restocking.noItems') }}</p>
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('restocking.sku') }}</th>
                <th>{{ t('restocking.itemName') }}</th>
                <th>{{ t('restocking.category') }}</th>
                <th>{{ t('restocking.warehouse') }}</th>
                <th>{{ t('restocking.currentStock') }}</th>
                <th>{{ t('restocking.reorderPoint') }}</th>
                <th>{{ t('restocking.recommendedQty') }}</th>
                <th>{{ t('restocking.unitCost') }}</th>
                <th>{{ t('restocking.estimatedCost') }}</th>
                <th>{{ t('restocking.priority') }}</th>
                <th>{{ t('restocking.reason') }}</th>
                <th v-if="activeBudget">{{ t('restocking.budgetStatus') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rec in recommendations"
                :key="rec.id"
                :class="{ 'row-out-of-budget': activeBudget && rec.within_budget === false }"
              >
                <td><strong>{{ rec.sku }}</strong></td>
                <td>{{ rec.name }}</td>
                <td>{{ rec.category }}</td>
                <td>{{ rec.warehouse }}</td>
                <td>
                  <span :class="['stock-value', { 'stock-critical': rec.current_stock <= rec.reorder_point }]">
                    {{ rec.current_stock }}
                  </span>
                </td>
                <td>{{ rec.reorder_point }}</td>
                <td><strong>{{ rec.recommended_qty }}</strong></td>
                <td>{{ formatCurrency(rec.unit_cost, currentCurrency.value) }}</td>
                <td><strong>{{ formatCurrency(rec.estimated_cost, currentCurrency.value) }}</strong></td>
                <td>
                  <span :class="['badge', rec.priority]">{{ t(`priority.${rec.priority}`) }}</span>
                </td>
                <td class="reason-cell">{{ t(`restocking.reasons.${rec.reason}`) }}</td>
                <td v-if="activeBudget">
                  <span v-if="rec.within_budget" class="badge success">{{ t('restocking.budgetOk') }}</span>
                  <span v-else class="badge danger">{{ t('restocking.budgetOver') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { formatCurrency } from '../utils/currency'

const loading = ref(true)
const error = ref(null)
const recommendations = ref([])
const budgetInput = ref(null)
const activeBudget = ref(null)

const { selectedPeriod, selectedLocation, selectedCategory, selectedStatus, getCurrentFilters } = useFilters()
const { t, currentCurrency } = useI18n()

const highPriorityCount = computed(() =>
  recommendations.value.filter(r => r.priority === 'high').length
)

const totalEstimatedCost = computed(() =>
  recommendations.value.reduce((sum, r) => sum + r.estimated_cost, 0)
)

const withinBudgetCount = computed(() =>
  recommendations.value.filter(r => r.within_budget === true).length
)

const loadRecommendations = async () => {
  try {
    loading.value = true
    error.value = null
    const filters = getCurrentFilters()
    recommendations.value = await api.getRestockingRecommendations(filters, activeBudget.value)
  } catch (err) {
    console.error('Failed to load restocking recommendations:', err)
    error.value = t('restocking.loading').replace('...', '') + ' — ' + t('common.error').toLowerCase()
  } finally {
    loading.value = false
  }
}

const applyBudget = async () => {
  if (!budgetInput.value || budgetInput.value <= 0) return
  activeBudget.value = budgetInput.value
  await loadRecommendations()
}

const clearBudget = async () => {
  budgetInput.value = null
  activeBudget.value = null
  await loadRecommendations()
}

watch([selectedPeriod, selectedLocation, selectedCategory, selectedStatus], loadRecommendations)

onMounted(loadRecommendations)
</script>

<style scoped>
.budget-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

.budget-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  white-space: nowrap;
}

.budget-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
}

.budget-input {
  width: 280px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #334155;
  outline: none;
  transition: border-color 0.2s;
}

.budget-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #94a3b8;
  color: #334155;
}

.budget-active-badge {
  padding: 0.375rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
}

.cost-value {
  font-size: 1.875rem;
}

.stock-critical {
  color: #dc2626;
  font-weight: 700;
}

.row-out-of-budget {
  opacity: 0.5;
}

.reason-cell {
  font-size: 0.813rem;
  color: #64748b;
  max-width: 200px;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #64748b;
  font-size: 1.125rem;
  font-weight: 600;
}
</style>
