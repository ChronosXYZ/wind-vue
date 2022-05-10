<template>
    <div id="header" role="banner">
        <div id="sr-header-area">
            <div class="width-clip">
                <div class="sr-list">
                    <ul class="flat-list sr-bar hover">
                        <li style="margin-left: .5em; padding-left: .5em;"></li>
                        <li v-for="n in newsgroupList">
                            <HeaderBarLink :label="n"/>
                            <span class="separator">-</span>
                        </li>
                    </ul>
                </div>
                <a id="sr-more-link">more</a>
            </div>
        </div>
        <div id="header-bottom-left">
            <img id="header-img" class="default-header" src="../assets/wind_logo.png">
        </div>
    </div>
</template>

<script lang="ts">
import HeaderBarLink from './HeaderBarLink.vue';
import { defineComponent } from "vue";

export default defineComponent({
    name: "Header",
    components: {
        HeaderBarLink
    },
    data() {
        return {
            newsgroupList: [
                "talk.politics",
                "talk.religion",
                "comp.os.linux",
                "ru.moscow"
            ]
        }
    }
});
</script>