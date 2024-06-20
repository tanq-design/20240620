<script setup>
import { ref } from 'vue';
import DisplayList from '../components/DisplayList.vue'
import InputForm from '../components/InputForm.vue'

const child = ref(null);

function submitAction() {
    child.value.updateList();
}
</script>

<template>
    <InputForm @submit="submitAction"></InputForm>
    <DisplayList ref="child" client:load></DisplayList>
</template>