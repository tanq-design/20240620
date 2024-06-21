<script setup>
const props = defineProps(['user']);

console.log(props.user);

</script>

<template>
    <button onclick="location.href='/login/github'" type="button">Login</button>
</template>