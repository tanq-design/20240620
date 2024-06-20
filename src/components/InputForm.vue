<script setup>
import { ref } from 'vue'

const title = defineModel('title');
const content = defineModel('content');
const message = ref("入力してください");
const emit = defineEmits(['submit'])

async function submitData() {
    const jsonbody = { title: title.value, content: content.value };

    const res = await fetch('v1/memo', {
        method: 'POST',
        body: JSON.stringify(jsonbody)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error, status: ${response.status}, text: ${response.statusText}`);
            }
            message.value = "記録しました";
            title.value = "";
            content.value = "";

            emit('submit');
        })
        .catch((error) => {
            message.value = `記録に失敗しました<${error}>`;
        });
}
</script>

<template>
    <form>
        <label>タイトル
            <input v-model="title" type="text" placeholder="TITLE">
        </label>
        <label>内容
            <textarea v-model="content" placeholder="CONTENT"></textarea>
        </label>
        <button type="button" @click="submitData">Submit</button>
    </form>
    <div>
        {{ message }}
    </div>
</template>