<template>
  <header class="main-header">
    <div class="header-row">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <span class="logo-text">JUDODEX</span>
        </router-link>
      </div>

      <div class="header-center">
        <div class="search-input-wrapper">
          <font-awesome-icon icon="search" class="search-input-icon" />
          <input
            type="text"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            placeholder="Rechercher une technique..."
            class="search-input"
          />
        </div>
      </div>

      <div class="header-right">
        <div class="icon-group">
          <button class="icon-button" @click="$emit('toggle-filters')">
            <font-awesome-icon icon="filter" />
          </button>
          <button class="icon-button">
            <font-awesome-icon icon="bars" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router';

export default defineComponent({
  name: 'Header',
  components: {
    RouterLink,
  },
  props: {
    modelValue: String,
  },
  emits: ['update:modelValue', 'toggle-filters'],
});
</script>

<style scoped>
.main-header {
  background-color: var(--color-primary-dark);
  color: var(--color-text-light);
  padding: 15px 20px;
  box-shadow: 0 2px 5px var(--color-shadow);
  width: 100%;
  margin: 0;
  left: 0;
  top: 0;
  position: relative;
  box-sizing: border-box;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: nowrap;
}

.header-left {
  flex: 0 0 auto; /* largeur fixe selon contenu */
}

.logo-link {
  font-size: 1.8em;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--color-text-light);
  letter-spacing: 2px;
  white-space: nowrap;
}

.header-center {
  flex: 1 1 auto; /* prend toute la place restante */
  display: flex;
  justify-content: center;
  min-width: 0; /* important pour permettre le rétrécissement */
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 100%; /* prend toute la place dans header-center */
  min-width: 0; /* important pour rétrécir sous flex */
  box-sizing: border-box;
}

.search-input-icon {
  margin-right: 10px;
  color: var(--color-primary-dark);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  font-size: 1em;
  outline: none;
  min-width: 0;
}

.header-right {
  flex: 0 0 auto; /* largeur fixe selon contenu */
  display: flex;
  gap: 15px;
  min-width: 80px; /* pour éviter trop petit */
}

.icon-group {
  display: flex;
  gap: 15px;
}

.icon-button {
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: 1.2em;
  cursor: pointer;
  transition: color 0.3s ease;
}

.icon-button:hover {
  color: #f0f0f0;
}

@media (max-width: 768px) {
  .search-input-wrapper {
    padding: 8px 10px;
  }

  .search-input {
    font-size: 0.9em;
  }

  .icon-button {
    font-size: 1em;
  }

  .header-row {
    gap: 10px;
  }
}
</style>


