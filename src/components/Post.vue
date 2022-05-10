<template>
    <div class="thing link post">
        <span class="number">{{number}}</span>
        <div class="entry">
            <p class="title"><a class="title">{{title}}</a></p>
            <p>by {{author}} {{timeAgo}} ago | {{commentsCount}} comments</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Post",
    props: {
        number: { required: true, type: Number },
        author: { required: true, type: String },
        title: { required: true, type: String },
        commentsCount: { required: true, type: Number },
        timeAgo: {required: true, type: String}
    }
});
</script>

<style>
.post {
    margin: 10px;
    display: flex;
}

.entry {
    align-self: center;
}

.number {
    align-self: center;
    color: #c6c6c6;
    font-family: arial;
    font-size: medium;
    margin: 10px;
}

.link {
    padding-left: 0;
}
</style>