<template>
    <a class="random">{{label}}</a>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        label: {required: true, type: String}
    }
})
</script>