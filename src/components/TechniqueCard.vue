<template>
    <div class="technique-card">
        <img :src="image" :alt="title" class="technique-image" />
        <h3 class="technique-title">{{ title }}</h3>
    </div>
</template>

<script>
export default {
    // Les "props" sont les données que ce composant recevra de son parent.
    props: {
        title: {
            type: String, // Le titre doit être une chaîne de caractères
            required: true // Et il est obligatoire
        },
        image: {
            type: String, // L'image doit être une chaîne de caractères (URL)
            required: true // Et elle est obligatoire
        }
    }
}
</script>

<style scoped>
/* Le mot-clé "scoped" signifie que ces styles n'affecteront que ce composant */
.technique-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    cursor: pointer;
    /* Indique que la carte est cliquable */
    background-color: #fff;
    /* Fond blanc pour les cartes */
}

.technique-card:hover {
    transform: translateY(-5px);
    /* Un petit effet au survol */
}

.technique-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 10px;
}

.technique-title {
    font-size: 1.2em;
    color: #333;
    margin: 0;
}
</style>