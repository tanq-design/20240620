<script setup>
import { ref, onMounted, computed } from 'vue';
const memos = ref(0);

onMounted(() => {
    getMemos();
});

async function getMemos() {
    const response = await fetch('v1/memo');
    const json = await response.json();

    if (json.body.memos) {
        memos.value = json.body.memos;
    }
}
</script>

<template>
    <div>
        <dl>
            <template v-for="memo in memos">
                <dt>{{ memo.id }}:{{ memo.title }}</dt>
                <dd>{{ memo.content }}</dd>
            </template>
        </dl>
    </div>
</template>