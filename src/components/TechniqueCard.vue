<template>
  <div class="technique-card">
    <img :src="image" :alt="title" class="technique-image" />
    <h3 class="technique-title">{{ title }}</h3>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import '../styles/_variables.scss';
.technique-card {
  width: 200px;
  height: 200px;
  border: 1px solid $color-border;
  border-radius: 16px;
  padding: 15px;
  text-align: center;
  box-shadow: 2px 2px 8px $color-shadow;
  transition: transform 0.2s;
  cursor: pointer;
  background-color: $color-text-light;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    transform: translateY(-5px);
  }
}

.technique-image {
  width: 100%;
  height: 120px;
  object-fit: contain;
  object-position: center center;
  border-radius: 10px;
  margin-bottom: 10px;
  background: #f5f5f5;
  display: block;
}

.technique-title {
  font-size: 1.2em;
  color: $color-text-dark;
  margin: 0;
  word-break: break-word;
}

@media (max-width: 400px) {
  .technique-card {
    width: 160px;
    height: 160px;
    padding: 8px;
  }
  .technique-image {
    height: 90px;
    margin-bottom: 6px;
    border-radius: 8px;
  }
}
</style>
