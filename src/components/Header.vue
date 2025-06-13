<template>
  <header class="main-header">
    <div class="header-row">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <span class="logo-text">
            <span class="judo-part">JUDO</span><span class="dex-part">DEX</span>
          </span>
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
          <div class="filter-dropdown-wrapper">
            <button
              class="icon-button filter-toggle"
              :class="{ 'active-filter': dropdownOpen }"
              @click="toggleDropdown"
              :aria-expanded="dropdownOpen.toString()"
              aria-label="Afficher les filtres"
            >
              <font-awesome-icon icon="filter" />
            </button>
            <div v-if="dropdownOpen" class="filter-dropdown-menu">
              <div class="radio-group">
                <label
                  v-for="ceinture in ceintures"
                  :key="ceinture.value"
                  class="checkbox-label"
                >
                  <input
                    type="radio"
                    name="ceinture"
                    :value="ceinture.value"
                    v-model="selectedCeinture"
                    @change="onRadioChange"
                  />
                  {{ ceinture.label }}
                </label>
                <label class="checkbox-label">
                  <input
                    type="radio"
                    name="ceinture"
                    :value="null"
                    v-model="selectedCeinture"
                    @change="onRadioChange"
                  />
                  Aucune
                </label>
              </div>
            </div>
          </div>

          <button
            class="icon-button"
            @click="$emit('toggle-menu')"
            aria-label="Ouvrir le menu"
          >
            <font-awesome-icon icon="bars" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'Header',
  components: {
    RouterLink,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    selectedCeintures: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'toggle-menu', 'update-ceintures'],
  setup(props, { emit }) {
    const dropdownOpen = ref(false)

    const ceintures = [
      { value: 'blanche', label: 'Blanche' },
      { value: 'jaune', label: 'Jaune' },
      { value: 'orange', label: 'Orange' },
      { value: 'verte', label: 'Verte' },
      { value: 'bleue', label: 'Bleue' },
      { value: 'marron', label: 'Marron' },
      { value: 'noire', label: 'Noire' },
    ]

    const selectedCeinture = ref(props.selectedCeintures[0] || '');

    watch(() => props.selectedCeintures, (val) => {
      selectedCeinture.value = val[0] || '';
    });

    function toggleDropdown() {
      dropdownOpen.value = !dropdownOpen.value
    }

    function onRadioChange() {
      emit('update-ceintures', selectedCeinture.value ? [selectedCeinture.value] : []);
    }

    return {
      dropdownOpen,
      ceintures,
      selectedCeinture,
      toggleDropdown,
      onRadioChange,
    }
  },
})
</script>



<style scoped lang="scss">
@use '../styles/variables' as *;

$color-primary-dark: #400A0A;
$color-text-light: #FFFFFF;
$color-shadow: rgba(0, 0, 0, 0.1);

.main-header {
  background-color: $color-primary-dark;
  color: $color-text-light;
  padding: 15px 20px;
  box-shadow: 0 2px 5px $color-shadow;
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
  flex: 0 0 auto;
}

.logo-link {
  font-size: 1.8em;
  font-weight: bold;
  text-transform: uppercase;
  color: $color-text-light;
  letter-spacing: 2px;
  white-space: nowrap;
  text-decoration: none; // enlève le soulignement
}

.dex-part {
  color: $color-primary-red;
}

.header-center {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.search-input-icon {
  margin-right: 10px;
  color: $color-primary-dark;
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
  flex: 0 0 auto;
  display: flex;
  gap: 15px;
  min-width: 80px;
}

.icon-group {
  display: flex;
  gap: 15px;
}

.icon-button {
  background: none;
  border: none;
  color: $color-text-light;
  font-size: 1.2em;
  cursor: pointer;
  transition: color 0.3s ease;
}

.icon-button:hover {
  color: #f0f0f0;
}

.filter-dropdown-wrapper {
  position: relative;
  display: inline-block;

  .filter-button {
    padding: 10px 15px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: $color-primary-red;
    color: white;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background-color: lighten($color-primary-red, 10%);
    }
  }

  .filter-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    left: auto;
    z-index: 10;
    background: #fff;
    color: $color-text-dark;
    border-radius: 0; // <-- plus de bords arrondis
    box-shadow: 0 8px 24px rgba(0,0,0,0.18); // <-- ombre plus marquée
    min-width: 180px;
    padding: 16px;
    margin-top: 8px;
    display: block;
    border: 1px solid #ddd; // optionnel : fine bordure grise
  }
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  font-size: 1em;
  color: $color-text-dark;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

input {
  margin-right: 10px;
  accent-color: $color-primary-red;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: white;
  font-size: 1em;
  cursor: pointer;
  flex-grow: 1;
  min-width: 150px;
}

.icon-button.filter-toggle {
  background: #fff;
  color: $color-primary-dark;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s, border 0.2s;
  padding: 8px 8px;      // <-- réduit le padding
  font-size: 1em;        // <-- tu peux descendre à 0.95em ou 0.9em si tu veux encore plus petit

  &.active-filter {
    background: $color-primary-red;
    color: #fff;
    border-color: $color-primary-red;
  }
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
